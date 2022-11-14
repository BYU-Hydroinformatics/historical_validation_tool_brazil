import numpy as np
from scipy import stats
from sklearn.metrics import confusion_matrix, mean_squared_error
from sklearn.utils.multiclass import unique_labels


# Main objects
##############################################################################
class Calc_return_period:
    def __init__(self):
        self.rp_dict = {'obs'       : {},
                        'normal'    : {'fun' : stats.norm,
                                       'para' : {'loc'  : None,
                                                 'scale': None}},
                        'lognormal' : {'fun' : stats.pearson3,
                                       'para' : {'loc'  : None,
                                                 'scale': None,
                                                 'skew' : 1}},
                        'weibull'   : {'fun' : stats.dweibull,
                                       'para' : {'loc'  : None,
                                                 'scale': None,
                                                 'c'    : 1}},
                        'chi2'      : {'fun' : stats.chi2,
                                       'para' : {'loc'  : None,
                                                 'scale': None,
                                                 'df'   : 2}},
                        'gumbel'    : {'fun' : stats.gumbel_r,
                                       'para' : {'loc'  : None,
                                                 'scale': None}}}


    def __call__(self, kwargs):
        """
        Input:
            t    : list = Return periode
            data : list = time series
        Output:
            st   : float = Best streamflow approximation for t return periode
        """
        # Unpacking input
        t    = kwargs.get('t', None)
        data = kwargs.get('data', None)

        # Main values
        data = np.array(data).astype(float)#.flatten()
        p = 1 - (np.array(t).astype(float) ** -1)
        mean = np.nanmean(data)
        std = np.nanstd(data)
        
        # obs calc
        data_hist, bind_edges = np.histogram(a=data, bins='sturges', density=True)
        self.rp_dict['obs'].update({'data' : data_hist})
        bind_edges_mean = (bind_edges[:-1] + bind_edges[1:]) / 2.0
        self.rp_dict['obs'].update({'bind' : bind_edges_mean})

        # PDF calc
        for distri in self.rp_dict.keys():
            if 'obs' == distri:
                continue

            # Extract pdf
            self.rp_dict[distri].update({'pdf' : self.__extracpdf__(distri=distri, bind=bind_edges_mean, mean=mean, std=std)})
            self.rp_dict[distri].update({'metrics': self.__calcmetricts__(distri=distri)})

        return self.__ppfbestmetric__(p=p)


    # Get method
    def get_summarice_proccess(self):
        return self.rp_dict


    # Hiden methods
    def __ppfbestmetric__(self, p):
        '''
        Input:
            p   : list = Exceedance probability
        Output:
            ppf : list = Best approximation results
        '''
        best_distri = [[distri, self.rp_dict[distri]['metrics']] for distri in self.rp_dict.keys() if distri != 'obs']
        best_distri = np.reshape(best_distri, (len(best_distri), 2)).T
        best_distri = best_distri[:, best_distri[1].astype(float) == min(best_distri[1].astype(float))][0][0]
        self.rp_dict['obs'].update({'best_distri' : best_distri})

        return self.rp_dict[best_distri]['fun'].ppf(q=p, **self.rp_dict[best_distri]['para'])


    def __calcmetricts__(self, distri):
        sim = self.rp_dict[distri]['pdf']
        obs = self.rp_dict['obs']['data']
        return mean_squared_error(y_true=obs,y_pred=sim)


    def __extracpdf__(self, distri, bind, mean, std):
        self.rp_dict[distri]['para']['loc'] = mean
        self.rp_dict[distri]['para']['scale'] = std
        return self.rp_dict[distri]['fun'].pdf(x=bind, **self.rp_dict[distri]['para'])
##############################################################################

# Main functions
def calc_return_period(**kwargs):
    """
    Input:
        t    : list = Return periode
        data : list = time series
    Output:
        st   : float = Best streamflow approximation for t return periode
    """
    foo = Calc_return_period()
    return foo(kwargs)
##############################################################################

def get_confusion_matrix_data(obs, sim):

    # labels = unique_labels(obs, sim)
    labels = [0, 1, 2, 3, 4, 5, 6]
    rv = confusion_matrix(y_true=obs,
                          y_pred=sim,
                          labels=labels)
    return rv, labels


def get_norm_confusion_mat(mat):
    mat_max = np.max(mat, axis=1)
    n_mat = np.multiply(mat.T, 1./mat_max)
    return n_mat.T


def accuracy_from_array(conf_mat):
    tp = np.sum(np.trace(conf_mat))
    all = np.sum(np.sum(conf_mat))
    return tp / all


def accuracy_from_colum(conf_mat):

    conf_mat_sim  = conf_mat[:7, :]
    conf_mat_rsim = conf_mat[7:, :]

    conf_mat_sim  = conf_mat_sim.T
    conf_mat_rsim = conf_mat_rsim.T

    # Fix this
    def tmp_fun(conf_mat):

        accuracy = []
        accuracy_gt = []
        accuracy_lt = []

        for num_col in range(len(conf_mat)):
            col_mat = conf_mat[:, num_col]

            accuracy.append(col_mat[num_col] / np.sum(col_mat))
            accuracy_lt.append(np.sum(col_mat[:num_col]) / np.sum(col_mat))
            accuracy_gt.append(np.sum(col_mat[num_col:]) / np.sum(col_mat))

        accuracy = [   '{0:.0f}%'.format(100 * ii) for ii in accuracy]
        accuracy_gt = ['{0:.0f}%'.format(100 * ii) for ii in accuracy_gt]
        accuracy_lt = ['{0:.0f}%'.format(100 * ii) for ii in accuracy_lt]

        return accuracy, accuracy_gt, accuracy_lt

    accuracy_obs_sim,  accuracy_gt_obs_sim,  accuracy_lt_obs_sim  = tmp_fun(conf_mat_sim)
    accuracy_obs_sraw, accuracy_gt_obs_sraw, accuracy_lt_obs_sraw = tmp_fun(conf_mat_rsim)

    accuracy    = [accuracy_obs_sim, accuracy_obs_sraw]
    accuracy_gt = [accuracy_gt_obs_sim, accuracy_gt_obs_sraw]
    accuracy_lt = [accuracy_lt_obs_sim, accuracy_lt_obs_sraw]

    return accuracy, accuracy_gt, accuracy_lt


def get_zoom_coords(df, lat='Latitude', lon='Longitude'):

    threshold = 0.05
    df[lat] = df[lat].astype(float)
    df[lon] = df[lon].astype(float)


    min_lat = df[lat].min() - threshold
    max_lat = df[lat].max() + threshold

    min_lon = df[lon].min() - threshold
    max_lon = df[lon].max() + threshold

    lat_coord = [min_lat, max_lat, min_lat, max_lat]
    lon_coord = [min_lon, min_lon, max_lon, max_lon]
    return lat_coord, lon_coord