import os
import uuid
import json
import pandas as pd
import numpy as np

from .auxFun import *

class Model:

    def __init__(self):
        self.gnrl_dict = {'Main return periods': [2, 5, 10, 25, 50, 100]}
    

    # Get methods for return period
    def get_asigned_return_period(self, *args, **kwards):
        self.return_periods_calcs = self.__return_periods_calcs__(*args, **kwards)
        return next(self.return_periods_calcs)
    

    def get_confusion_matrix(self):
        return next(self.return_periods_calcs)


    def get_summmarice_return_period(self):
        rv = next(self.return_periods_calcs)
        del self.return_periods_calcs
        return rv


    @staticmethod
    def get_return_periode(*args, **kwards):
        return calc_return_period(*args, **kwards)


    # Hiden metods
    def __return_periods_calcs__(self, obs_df, sim_df, sim_raw):
        #################################
        # GET_ASSIGNED_RETURN_PERIODE
        #################################
        # Read data
        obs_df  = obs_df.copy()
        sim_df  = sim_df.copy()
        sim_raw = sim_raw.copy()
        list_retourn_periode_data = self.gnrl_dict['Main return periods']

        # Max daily data
        anual_max_obs  = obs_df.groupby(obs_df.index.year).max()
        anual_max_obs.dropna(inplace=True)
        anual_max_sim  = sim_df.groupby(sim_df.index.year).max()
        anual_max_sim.dropna(inplace=True)
        anual_max_sraw = sim_raw.groupby(sim_raw.index.year).max()
        anual_max_sraw.dropna(inplace=True)

        # Calc return periode
        obs_return_periode  = self.get_return_periode(t    = list_retourn_periode_data,
                                                      data = list(anual_max_obs.values))
        sim_return_periode  = self.get_return_periode(t    = list_retourn_periode_data,
                                                      data = list(anual_max_sim.values))
        sraw_return_periode = self.get_return_periode(t    = list_retourn_periode_data,
                                                      data = list(anual_max_sraw.values))

        # Add column of return periode for any time serie
        obs_df['Return periods'] = 0.0
        q_range_obs = []
        sim_df['Return periods'] = 0.0
        q_range_sim = []
        sim_raw['Return periods'] = 0.0
        q_range_sraw = []

        # Reclassify ranges for time series
        for num, retunr_periode  in enumerate(zip(obs_return_periode[1:], sim_return_periode[:], sraw_return_periode[:]), 1):

            return_periode_obs, return_periode_sim, return_periode_sraw = retunr_periode

            # Observed time serie
            valids = (obs_df[obs_df.columns[0]] >= obs_return_periode[num-1]) &\
                     (obs_df[obs_df.columns[0]] <  obs_return_periode[num])
            obs_df.loc[valids, 'Return periods'] = float(num)    
            q_range_obs.append([obs_return_periode[num-1], obs_return_periode[num]])

            # Fix simulated time serie
            valids = (sim_df[sim_df.columns[0]] >= sim_return_periode[num-1]) &\
                     (sim_df[sim_df.columns[0]] <  sim_return_periode[num])
            sim_df.loc[valids, 'Return periods'] = float(num)
            q_range_sim.append([sim_return_periode[num-1], sim_return_periode[num]])

            # Simulated time serie
            valids = (sim_raw[sim_raw.columns[0]] >= sraw_return_periode[num-1]) &\
                     (sim_raw[sim_raw.columns[0]] <  sraw_return_periode[num])
            sim_raw.loc[valids, 'Return periods'] = float(num)  
            q_range_sraw.append([sraw_return_periode[num-1], sraw_return_periode[num]])

        # Add classification for the last range
        valids = (obs_df[obs_df.columns[0]] >= obs_return_periode[num])
        obs_df.loc[valids, 'Return periods'] = float(num + 1)    

        valids = (sim_df[sim_df.columns[0]] >= sim_return_periode[num])
        sim_df.loc[valids, 'Return periods'] = float(num + 1)

        valids = (sim_raw[sim_raw.columns[0]] >= sraw_return_periode[num])
        sim_raw.loc[valids, 'Return periods'] = float(num + 1)  

        # Build returnd data for yield 1
        data_return_periode = [obs_return_periode, 
                               sim_return_periode,
                               sraw_return_periode]
        data_return_array   = [obs_df['Return periods'].values,
                               sim_df['Return periods'].values,
                               sim_raw['Return periods'].values]
        q_range             = [q_range_obs, q_range_sim, q_range_sraw]

        print('    1. get assigned return periode')

        yield data_return_periode, data_return_array, q_range

        #################################
        # GET_CONFUSSION_MATRIX
        #################################
        obs_returnperiod_arr  = obs_df['Return periods'].values
        sim_returnperiod_arr  = sim_df['Return periods'].values
        sraw_returnperiod_arr = sim_raw['Return periods'].values

        # Get confussion matrix
        conf_matrix_obs_sim,  labels_obs_sim = get_confusion_matrix_data(obs=obs_returnperiod_arr.tolist(), 
                                                        sim=sim_returnperiod_arr.tolist())
        conf_matrix_obs_sim = conf_matrix_obs_sim.T

        conf_matrix_obs_sraw, labels_obs_sraw = get_confusion_matrix_data(obs=obs_returnperiod_arr.tolist(), 
                                                        sim=sraw_returnperiod_arr.tolist())
        conf_matrix_obs_sraw = conf_matrix_obs_sraw.T

        # Normalize row in confussion matrix
        conf_matrix_norm_obs_sim  = get_norm_confusion_mat(conf_matrix_obs_sim)
        conf_matrix_norm_obs_sraw = get_norm_confusion_mat(conf_matrix_obs_sraw)

        conf_matrix      = np.concatenate((conf_matrix_obs_sim, conf_matrix_obs_sraw), axis=0)
        conf_matrix_norm = np.concatenate((conf_matrix_norm_obs_sim, conf_matrix_norm_obs_sraw), axis=0)
        
        # Extract labels names
        labels_obs       = self.__labels_fun__(q_range_obs)
        labels_sim       = self.__labels_fun__(q_range_sim)
        labels_sraw      = self.__labels_fun__(q_range_sraw)

        # Add suffix to labelas names
        labels_obs  = [ii + ' (Obs.)' for ii in labels_obs]
        labels_sim  = [ii + ' (Sim.)' for ii in labels_sim]
        labels_sraw = [ii + ' (Sim. Corr.)' for ii in labels_sraw]

        # Build return data
        labels = [labels_obs, labels_sim + labels_sraw]

        print('    2. Get confussion matrix.')

        yield conf_matrix, conf_matrix_norm, labels

        #################################
        # GET_SUMMARICE_RETURN_PERIODE
        #################################

        # Extract data for table
        gnrl_accuracy = accuracy_from_array(conf_mat = conf_matrix)
        # Sort data of accuracy
        colm_accuracy, colm_accuracy_gt, colm_accuracy_lt = accuracy_from_colum(conf_mat = conf_matrix)
        
        print('    3. Get summarice return periode.')

        yield self.__accuracy_to_table__(accuracy    = colm_accuracy, 
                                         accuracy_gt = colm_accuracy_gt,
                                         accuracy_lt = colm_accuracy_lt,
                                         labels      = labels)


    @staticmethod
    def __labels_fun__(q_range):
        labels = ['[ < {0:.2f}]'.format(q_range[0][0])]
        for num in range(len(q_range)):
            labels.append('[{0:.2f} - {1:.2f}]'.format(q_range[num][0], q_range[num][1]))
        labels.append('[ > {0:.2f}]'.format(q_range[num][1]))
        return labels


    @staticmethod
    def __accuracy_to_table__(accuracy, accuracy_lt, accuracy_gt, labels):
        # Build dataframe
        rv = pd.DataFrame({'Caudal m3/s (Cor)'                   : labels[1][:7],
                           'Precisión (Cor)'                     : accuracy[0],
                           'Precisión (pronóstico menor) (Cor)'  : accuracy_lt[0],
                           'Precisión (pronóstico mayor) (Cor)'  : accuracy_gt[0],
                           'Caudal m3/s (Sim)'                   : labels[1][7:],
                           'Precisión (Sim)'                     : accuracy[1],
                           'Precisión (pronóstico menor) (Sim)'  : accuracy_lt[1],
                           'Precisión (pronóstico mayor) (Sim)'  : accuracy_gt[1],
                           })
        rv = rv.T
        return rv


######################################################################
class Stations_manage:
    def __init__(self, path_dir):
        '''
        Stations management object
        '''

        self.path = os.sep.join(path_dir.split(os.sep)[:-1])
        self.full_data = self.__readfile__(path_dir)
        
        self.gnrl_dict = {'columns int search' : ['CodEstacao', 'new_COMID'],
                          'columns str search' : ['NomeEstaca', 'NomeRio'],
                          'coord columns' : ['Latitude', 'Longitude']}
        
        self.data = self.full_data[self.gnrl_dict['columns int search'] + self.gnrl_dict['columns str search'] + self.gnrl_dict['coord columns']]
        self.data.reset_index(inplace=True)
        self.data.rename(columns={'index': 'ID_tmp'}, inplace=True)

        self.search_list = self.__extract_search_list__()

        print('Stations list loaded.')

    
    def __call__(self, search_id):
        '''
        Input: 
            search_data : str = value to search
        '''

        # Extract coords of the station
        coords = self.__coordssearch___(search_id)

        # Assert does not existence of the station
        if len(coords) < 1:
            return 'Brazil.json', coords, 404, '', ''

        # Extract coords of the polygon
        lat_coord, lon_coord = get_zoom_coords(df=coords, lat='Latitude', lon='Longitude')

        # Build station output file
        output_station_file, station_file_cont = self.__printstaiongeojson__(df=coords)

        # Build coundary output file
        output_file, boundary_file_cont = self.__printgeojson__(lat_coord=lat_coord, lon_coord=lon_coord)

        return output_file, output_station_file, 200, station_file_cont, boundary_file_cont


    def __printstaiongeojson__(self, df):

        lon = self.gnrl_dict['coord columns'][1]
        lat = self.gnrl_dict['coord columns'][0]

        # TODO: Add variable name file for multyple user. And remove path
        # pathdir and name file
        # file_name = str(uuid.uuid4()) + '.json'
        file_name = 'station_geojson' + '.json'
        file_path = os.sep.join([self.path, file_name])


        # Build json
        feature = []
        for _, row in df.iterrows():
            feature.append({'type' : "Feature",
                            "geometry" : {"type" : "Point",
                                          "coordinates":[row[lon], row[lat]]}})
        json_file = {"type" : "FeatureCollection",
                     "features" : feature}


        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(json_file, f, ensure_ascii=False, indent=4)

        return file_name, json_file

    def __printgeojson__(self, lat_coord, lon_coord):
        
        # TODO: Add variable name file for multyple user. And remove path
        # pathdir and name file
        # file_name = str(uuid.uuid4()) + '.json'
        file_name = 'boundary_geojson' + '.json'
        file_path = os.sep.join([self.path, file_name])

        # Print json
        json_file = {"type":"FeatureCollection", 
                    "features": [{ "type" : "Feature",
                                   "geometry" : { "type"       : "Polygon",
                                                  "coordinates" : [[[lon_coord[0], lat_coord[0]],
                                                                    [lon_coord[1], lat_coord[1]],
                                                                    [lon_coord[3], lat_coord[3]],
                                                                    [lon_coord[2], lat_coord[2]]]]
                                                }
                                }]
                    }


        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(json_file, f, ensure_ascii=False, indent=4)
        
        return file_name, json_file


    def __coordssearch___(self, search_id):

        # Identify type of input
        try:
            # Search by code
            seach_case = 'int'
            search_id = str(int(search_id))
            columns_to_search = self.gnrl_dict['columns int search']
        except:
            # Search by name
            search_case = 'name'
            search_id = str(search_id).upper()
            columns_to_search = self.gnrl_dict['columns str search']

        
        # Extract column to search
        search_df = pd.DataFrame()
        for col in columns_to_search:
            tmp_df = pd.DataFrame()
            tmp_df['ID_tmp'] = self.data['ID_tmp']

           
            if seach_case == 'int':
                tmp_df['values'] = self.data[col].astype(str)
            elif seach_case == 'str':
                # TODO: Add decodifficator for spañish when by name is used
                tmp_df['values'] = self.data[col].astype(str)
            else:
                # TODO: Add search by lat,lon
                pass

            search_df = pd.concat([search_df, tmp_df], ignore_index=True)

        idtmp_to_search = search_df.loc[search_df['values'] == search_id]

        valids = self.data[columns_to_search].isin(idtmp_to_search['values'].values).values
        rv = self.data.loc[valids].copy()

        return rv


    def __extract_search_list__(self):
        rv = self.full_data[self.gnrl_dict['columns int search'] + self.gnrl_dict['columns str search']].copy()
        rv = np.unique(rv.values.ravel('F'))
        return rv.tolist()


    @staticmethod
    def __readfile__(path_dir):
        '''
        Read file for json (geojson) named -> IDEAM_Stations_v2.json
        '''
        data = json.load(open(path_dir))['features']
        df = pd.DataFrame()

        for line in data:
            line_data = line['properties']
            col_names = list(line_data.keys())
            col_data =[line_data[ii] for ii in col_names]
            tmp = pd.DataFrame(data = [col_data],
                               columns=col_names)
            df = pd.concat([df, tmp], ignore_index=True)

        for column in df.columns:
            df[column] = df[column].astype(str)

        return df

######################################################################