import datetime as dt
import io
import os
import traceback
from csv import writer as csv_writer

import calendar
import numpy as np
from bs4 import BeautifulSoup
import geoglows
import hydrostats as hs
import hydrostats.data as hd
import pandas as pd
import plotly.graph_objs as go
import requests
import math
import xmltodict
import pytz
import json
import scipy.stats as sp
from dateutil.relativedelta import relativedelta
from scipy import integrate
from HydroErr.HydroErr import metric_names, metric_abbr
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from tethys_sdk.gizmos import *

from .app import HistoricalValidationToolBrazil as app

import time

## global values ##
watershed = 'none'
subbasin = 'none'
comid = 'none'
codEstacion = 'none'
nomEstacion = 'none'
ts_id = 'none'
s = None
simulated_df = pd.DataFrame([(dt.datetime(1980, 1, 1, 0, 0), 0)], columns=['Datetime', 'Simulated Streamflow'])
simulated_df.set_index('Datetime', inplace=True)
observed_df = pd.DataFrame([(dt.datetime(1980, 1, 1, 0, 0), 0)], columns=['Datetime', 'Simulated Streamflow'])
observed_df.set_index('Datetime', inplace=True)
corrected_df = pd.DataFrame([(dt.datetime(1980, 1, 1, 0, 0), 0)], columns=['Datetime', 'Simulated Streamflow'])
corrected_df.set_index('Datetime', inplace=True)
forecast_df = pd.DataFrame({'A': []})
fixed_stats = None
forecast_record = None
fixed_records = None


def home(request):
    """
    Controller for the app home page.
    """

    # List of Metrics to include in context
    metric_loop_list = list(zip(metric_names, metric_abbr))

    # Retrieve a geoserver engine and geoserver credentials.
    geoserver_engine = app.get_spatial_dataset_service(
        name='main_geoserver', as_engine=True)

    geos_username = geoserver_engine.username
    geos_password = geoserver_engine.password
    my_geoserver = geoserver_engine.endpoint.replace('rest', '')

    geoserver_base_url = my_geoserver
    geoserver_workspace = app.get_custom_setting('workspace')
    region = app.get_custom_setting('region')
    geoserver_endpoint = TextInput(display_text='',
                                   initial=json.dumps([geoserver_base_url, geoserver_workspace, region]),
                                   name='geoserver_endpoint',
                                   disabled=True)

    # Available Forecast Dates
    res = requests.get('https://geoglows.ecmwf.int/api/AvailableDates/?region=central_america-geoglows', verify=False)
    data = res.json()
    dates_array = (data.get('available_dates'))

    dates = []

    for date in dates_array:
        if len(date) == 10:
            date_mod = date + '000'
            date_f = dt.datetime.strptime(date_mod, '%Y%m%d.%H%M').strftime('%Y-%m-%d %H:%M')
        else:
            date_f = dt.datetime.strptime(date, '%Y%m%d.%H%M').strftime('%Y-%m-%d')
            date = date[:-3]
        dates.append([date_f, date])
        dates = sorted(dates)

    dates.append(['Select Date', dates[-1][1]])
    dates.reverse()

    # Date Picker Options
    date_picker = DatePicker(name='datesSelect',
                             display_text='Date',
                             autoclose=True,
                             format='yyyy-mm-dd',
                             start_date=dates[-1][0],
                             end_date=dates[1][0],
                             start_view='month',
                             today_button=True,
                             initial='')

    region_index = json.load(open(os.path.join(os.path.dirname(__file__), 'public', 'geojson', 'index.json')))
    regions = SelectInput(
        display_text='Zoom to a Region:',
        name='regions',
        multiple=False,
        original=True,
        options=[(region_index[opt]['name'], opt) for opt in region_index]
    )

    context = {
        "metric_loop_list": metric_loop_list,
        "geoserver_endpoint": geoserver_endpoint,
        "date_picker": date_picker,
        "regions": regions
    }

    return render(request, 'historical_validation_tool_brazil/home.html', context)


def get_popup_response(request):
    """
    Get simulated data from api
    """

    start_time = time.time()

    get_data = request.GET
    return_obj = {}

    global watershed
    global subbasin
    global comid
    global codEstacion
    global nomEstacion
    global s
    global simulated_df
    global observed_df
    global corrected_df
    global forecast_df
    global fixed_stats
    global forecast_record
    global fixed_records

    watershed = 'none'
    subbasin = 'none'
    comid = 'none'
    codEstacion = 'none'
    nomEstacion = 'none'
    s = None
    simulated_df = pd.DataFrame([(dt.datetime(1980, 1, 1, 0, 0), 0)], columns=['Datetime', 'Simulated Streamflow'])
    simulated_df.set_index('Datetime', inplace=True)
    observed_df = pd.DataFrame([(dt.datetime(1980, 1, 1, 0, 0), 0)], columns=['Datetime', 'Simulated Streamflow'])
    observed_df.set_index('Datetime', inplace=True)
    corrected_df = pd.DataFrame([(dt.datetime(1980, 1, 1, 0, 0), 0)], columns=['Datetime', 'Simulated Streamflow'])
    corrected_df.set_index('Datetime', inplace=True)
    forecast_df = pd.DataFrame({'A': []})
    fixed_stats = None
    forecast_record = None
    fixed_records = None

    try:
        # get station attributes
        watershed = get_data['watershed']
        subbasin = get_data['subbasin']
        comid = get_data['streamcomid']
        codEstacion = get_data['stationcode']
        nomEstacion = get_data['stationname']

        '''Get Simulated Data'''
        simulated_df = geoglows.streamflow.historic_simulation(comid, forcing='era_5', return_format='csv')
        # Removing Negative Values
        simulated_df[simulated_df < 0] = 0
        simulated_df.index = simulated_df.index.to_series().dt.strftime("%Y-%m-%d")
        simulated_df.index = pd.to_datetime(simulated_df.index)
        simulated_df = pd.DataFrame(data=simulated_df.iloc[:, 0].values, index=simulated_df.index, columns=['Simulated Streamflow'])

        '''Get Observed Data'''
        codEstacion = get_data['stationcode']
        nomEstacion = get_data['stationname']

        now = dt.datetime.now()
        YYYY = str(now.year)
        MM = str(now.month)
        DD = now.day

        url = 'http://telemetriaws1.ana.gov.br/ServiceANA.asmx/HidroSerieHistorica?codEstacao={0}&DataInicio=01/01/1900&DataFim={1}/{2}/{3}&tipoDados=3&nivelConsistencia=1'.format(codEstacion, DD, MM, YYYY)

        response = requests.get(url, verify=False)

        soup = BeautifulSoup(response.content, "xml")
        times = soup.find_all('DataHora')
        valuesDay01 = soup.find_all('Vazao01')
        valuesDay02 = soup.find_all('Vazao02')
        valuesDay03 = soup.find_all('Vazao03')
        valuesDay04 = soup.find_all('Vazao04')
        valuesDay05 = soup.find_all('Vazao05')
        valuesDay06 = soup.find_all('Vazao06')
        valuesDay07 = soup.find_all('Vazao07')
        valuesDay08 = soup.find_all('Vazao08')
        valuesDay09 = soup.find_all('Vazao09')
        valuesDay10 = soup.find_all('Vazao10')
        valuesDay11 = soup.find_all('Vazao11')
        valuesDay12 = soup.find_all('Vazao12')
        valuesDay13 = soup.find_all('Vazao13')
        valuesDay14 = soup.find_all('Vazao14')
        valuesDay15 = soup.find_all('Vazao15')
        valuesDay16 = soup.find_all('Vazao16')
        valuesDay17 = soup.find_all('Vazao17')
        valuesDay18 = soup.find_all('Vazao18')
        valuesDay19 = soup.find_all('Vazao19')
        valuesDay20 = soup.find_all('Vazao20')
        valuesDay21 = soup.find_all('Vazao21')
        valuesDay22 = soup.find_all('Vazao22')
        valuesDay23 = soup.find_all('Vazao23')
        valuesDay24 = soup.find_all('Vazao24')
        valuesDay25 = soup.find_all('Vazao25')
        valuesDay26 = soup.find_all('Vazao26')
        valuesDay27 = soup.find_all('Vazao27')
        valuesDay28 = soup.find_all('Vazao28')
        valuesDay29 = soup.find_all('Vazao29')
        valuesDay30 = soup.find_all('Vazao30')
        valuesDay31 = soup.find_all('Vazao31')

        monthly__time = []
        values01 = []
        values02 = []
        values03 = []
        values04 = []
        values05 = []
        values06 = []
        values07 = []
        values08 = []
        values09 = []
        values10 = []
        values11 = []
        values12 = []
        values13 = []
        values14 = []
        values15 = []
        values16 = []
        values17 = []
        values18 = []
        values19 = []
        values20 = []
        values21 = []
        values22 = []
        values23 = []
        values24 = []
        values25 = []
        values26 = []
        values27 = []
        values28 = []
        values29 = []
        values30 = []
        values31 = []

        for i in range(0, len(times)):
            monthlyTime = times[i].next
            monthly__time.append(monthlyTime)
            value01 = valuesDay01[i].next
            values01.append(value01)
            value02 = valuesDay02[i].next
            values02.append(value02)
            value03 = valuesDay03[i].next
            values03.append(value03)
            value04 = valuesDay04[i].next
            values04.append(value04)
            value05 = valuesDay05[i].next
            values05.append(value05)
            value06 = valuesDay06[i].next
            values06.append(value06)
            value07 = valuesDay07[i].next
            values07.append(value07)
            value08 = valuesDay08[i].next
            values08.append(value08)
            value09 = valuesDay09[i].next
            values09.append(value09)
            value10 = valuesDay10[i].next
            values10.append(value10)
            value11 = valuesDay11[i].next
            values11.append(value11)
            value12 = valuesDay12[i].next
            values12.append(value12)
            value13 = valuesDay13[i].next
            values13.append(value13)
            value14 = valuesDay14[i].next
            values14.append(value14)
            value15 = valuesDay15[i].next
            values15.append(value15)
            value16 = valuesDay16[i].next
            values16.append(value16)
            value17 = valuesDay17[i].next
            values17.append(value17)
            value18 = valuesDay18[i].next
            values18.append(value18)
            value19 = valuesDay19[i].next
            values19.append(value19)
            value20 = valuesDay20[i].next
            values20.append(value20)
            value21 = valuesDay21[i].next
            values21.append(value21)
            value22 = valuesDay22[i].next
            values22.append(value22)
            value23 = valuesDay23[i].next
            values23.append(value23)
            value24 = valuesDay24[i].next
            values24.append(value24)
            value25 = valuesDay25[i].next
            values25.append(value25)
            value26 = valuesDay26[i].next
            values26.append(value26)
            value27 = valuesDay27[i].next
            values27.append(value27)
            value28 = valuesDay28[i].next
            values28.append(value28)
            value29 = valuesDay29[i].next
            values29.append(value29)
            value30 = valuesDay30[i].next
            values30.append(value30)
            value31 = valuesDay31[i].next
            values31.append(value31)

        daily_time = []
        monthly_time = []

        for i in range(0, len(monthly__time)):
            year = int(monthly__time[i][0:4])
            month = int(monthly__time[i][5:7])
            day = int(monthly__time[i][8:10])
            if day != 1:
                day = 1
            hh = int(monthly__time[i][11:13])
            mm = int(monthly__time[i][14:16])
            ss = int(monthly__time[i][17:19])
            monthlyTime = dt.datetime(year, month, day, hh, mm)
            monthly_time.append(monthlyTime)
            if month == 1:
                for j in range(0, 31):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 2:
                if calendar.isleap(year):
                    for j in range(0, 29):
                        date = dt.datetime(year, month, j + 1, hh, mm)
                        daily_time.append(date)
                else:
                    for j in range(0, 28):
                        date = dt.datetime(year, month, j + 1, hh, mm)
                        daily_time.append(date)
            elif month == 3:
                for j in range(0, 31):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 4:
                for j in range(0, 30):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 5:
                for j in range(0, 31):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 6:
                for j in range(0, 30):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 7:
                for j in range(0, 31):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 8:
                for j in range(0, 31):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 9:
                for j in range(0, 30):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 10:
                for j in range(0, 31):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 11:
                for j in range(0, 30):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)
            elif month == 12:
                for j in range(0, 31):
                    date = dt.datetime(year, month, j + 1, hh, mm)
                    daily_time.append(date)

        dischargeValues = []

        for date in daily_time:
            if date.day == 1:
                discharge = values01[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 2:
                discharge = values02[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 1, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 3:
                discharge = values03[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 2, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 4:
                discharge = values04[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 3, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 5:
                discharge = values05[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 4, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 6:
                discharge = values06[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 5, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 7:
                discharge = values07[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 6, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 8:
                discharge = values08[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 7, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 9:
                discharge = values09[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 8, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 10:
                discharge = values10[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 9, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 11:
                discharge = values11[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 10, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 12:
                discharge = values12[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 11, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 13:
                discharge = values13[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 12, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 14:
                discharge = values14[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 13, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 15:
                discharge = values15[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 14, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 16:
                discharge = values16[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 15, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 17:
                discharge = values17[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 16, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 18:
                discharge = values18[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 17, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 19:
                discharge = values19[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 18, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 20:
                discharge = values20[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 19, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 21:
                discharge = values21[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 20, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 22:
                discharge = values22[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 21, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 23:
                discharge = values23[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 22, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 24:
                discharge = values24[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 23, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 25:
                discharge = values25[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 24, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 26:
                discharge = values26[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 25, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 27:
                discharge = values27[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 26, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 28:
                discharge = values28[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 27, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 29:
                discharge = values29[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 28, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 30:
                discharge = values30[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 29, date.hour, date.minute))]
                dischargeValues.append(str(discharge))
            elif date.day == 31:
                discharge = values31[
                    monthly_time.index(dt.datetime(date.year, date.month, date.day - 30, date.hour, date.minute))]
                dischargeValues.append(str(discharge))

        pairs = [list(a) for a in zip(daily_time, dischargeValues)]
        pairs = sorted(pairs, key=lambda x: x[0])

        observed_df = pd.DataFrame(pairs, columns=['Datetime', 'Observed Streamflow'])
        observed_df.set_index('Datetime', inplace=True)
        observed_df = observed_df.replace(r'^\s*$', np.NaN, regex=True)
        observed_df["Observed Streamflow"] = pd.to_numeric(observed_df["Observed Streamflow"], downcast="float")

        observed_df[observed_df < 0] = 0

        observed_df.index = observed_df.index.to_series().dt.strftime("%Y-%m-%d")

        observed_df.index = pd.to_datetime(observed_df.index)

        '''Correct the Bias in Sumulation'''

        corrected_df = geoglows.bias.correct_historical(simulated_df, observed_df)

        '''Get Forecasts'''
        forecast_df = geoglows.streamflow.forecast_stats(comid, return_format='csv')
        # Removing Negative Values
        forecast_df[forecast_df < 0] = 0

        '''Correct Bias Forecasts'''
        fixed_stats = geoglows.bias.correct_forecast(forecast_df, simulated_df, observed_df)

        '''Get Forecasts Records'''
        try:
            forecast_record = geoglows.streamflow.forecast_records(comid)
            forecast_record[forecast_record < 0] = 0
            forecast_record = forecast_record.loc[
                forecast_record.index >= pd.to_datetime(forecast_df.index[0] - dt.timedelta(days=8))]

            '''Correct Bias Forecasts Records'''
            fixed_records = geoglows.bias.correct_forecast(forecast_record, simulated_df, observed_df, use_month=-1)
            fixed_records = fixed_records.loc[
                fixed_records.index >= pd.to_datetime(forecast_df.index[0] - dt.timedelta(days=8))]
        except:
            print('There is no forecast record')

        print("finished get_popup_response")

        print("--- %s seconds getpopup ---" % (time.time() - start_time))

        return JsonResponse({})

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_hydrographs(request):
    """
    Get observed data from CEMADEN web site
    Get historic simulations from ERA Interim
    """
    get_data = request.GET
    global codEstacion
    global nomEstacion
    global simulated_df
    global observed_df
    global corrected_df

    start_time = time.time()

    try:

        '''Plotting Data'''
        observed_Q = go.Scatter(x=observed_df.index, y=observed_df.iloc[:, 0].values, name='Observed', )
        simulated_Q = go.Scatter(x=simulated_df.index, y=simulated_df.iloc[:, 0].values, name='Simulated', )
        corrected_Q = go.Scatter(x=corrected_df.index, y=corrected_df.iloc[:, 0].values, name='Corrected Simulated', )

        layout = go.Layout(
            title='Observed & Simulated Streamflow at <br> {0} - {1}'.format(codEstacion, nomEstacion),
            xaxis=dict(title='Dates', ), yaxis=dict(title='Discharge (m<sup>3</sup>/s)', autorange=True),
            showlegend=True)

        chart_obj = PlotlyView(go.Figure(data=[observed_Q, simulated_Q, corrected_Q], layout=layout))

        context = {
            'gizmo_object': chart_obj,
        }

        print("--- %s seconds hydrographs ---" % (time.time() - start_time))

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_dailyAverages(request):
    """
    Get observed data from CEMADEN web site
    Get historic simulations from ERA Interim
    """
    get_data = request.GET
    global codEstacion
    global nomEstacion
    global simulated_df
    global observed_df
    global corrected_df

    start_time = time.time()

    try:

        '''Merge Data'''

        merged_df = hd.merge_data(sim_df=simulated_df, obs_df=observed_df)

        merged_df2 = hd.merge_data(sim_df=corrected_df, obs_df=observed_df)

        '''Plotting Data'''

        daily_avg = hd.daily_average(merged_df)

        daily_avg2 = hd.daily_average(merged_df2)

        daily_avg_obs_Q = go.Scatter(x=daily_avg.index, y=daily_avg.iloc[:, 1].values, name='Observed', )

        daily_avg_sim_Q = go.Scatter(x=daily_avg.index, y=daily_avg.iloc[:, 0].values, name='Simulated', )

        daily_avg_corr_sim_Q = go.Scatter(x=daily_avg2.index, y=daily_avg2.iloc[:, 0].values,
                                          name='Corrected Simulated', )

        layout = go.Layout(
            title='Daily Average Streamflow for <br> {0} - {1}'.format(codEstacion, nomEstacion),
            xaxis=dict(title='Days', ), yaxis=dict(title='Discharge (m<sup>3</sup>/s)', autorange=True),
            showlegend=True)

        chart_obj = PlotlyView(go.Figure(data=[daily_avg_obs_Q, daily_avg_sim_Q, daily_avg_corr_sim_Q], layout=layout))

        context = {
            'gizmo_object': chart_obj,
        }

        print("--- %s seconds dailyAverages ---" % (time.time() - start_time))

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_monthlyAverages(request):
    """
    Get observed data from CEMADEN web site
    Get historic simulations from ERA Interim
    """
    get_data = request.GET
    global codEstacion
    global nomEstacion
    global simulated_df
    global observed_df
    global corrected_df

    start_time = time.time()

    try:

        '''Merge Data'''

        merged_df = hd.merge_data(sim_df=simulated_df, obs_df=observed_df)

        merged_df2 = hd.merge_data(sim_df=corrected_df, obs_df=observed_df)

        '''Plotting Data'''

        monthly_avg = hd.monthly_average(merged_df)

        monthly_avg2 = hd.monthly_average(merged_df2)

        monthly_avg_obs_Q = go.Scatter(x=monthly_avg.index, y=monthly_avg.iloc[:, 1].values, name='Observed', )

        monthly_avg_sim_Q = go.Scatter(x=monthly_avg.index, y=monthly_avg.iloc[:, 0].values, name='Simulated', )

        monthly_avg_corr_sim_Q = go.Scatter(x=monthly_avg2.index, y=monthly_avg2.iloc[:, 0].values,
                                            name='Corrected Simulated', )

        layout = go.Layout(
            title='Monthly Average Streamflow for <br> {0} - {1}'.format(codEstacion, nomEstacion),
            xaxis=dict(title='Months', ), yaxis=dict(title='Discharge (m<sup>3</sup>/s)', autorange=True),
            showlegend=True)

        chart_obj = PlotlyView(
            go.Figure(data=[monthly_avg_obs_Q, monthly_avg_sim_Q, monthly_avg_corr_sim_Q], layout=layout))

        context = {
            'gizmo_object': chart_obj,
        }

        print("--- %s seconds monthlyAverages ---" % (time.time() - start_time))

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_scatterPlot(request):
    """
    Get observed data from CEMADEN web site
    Get historic simulations from ERA Interim
    """
    get_data = request.GET
    global codEstacion
    global nomEstacion
    global simulated_df
    global observed_df
    global corrected_df

    start_time = time.time()

    try:
        watershed = get_data['watershed']
        subbasin = get_data['subbasin']
        comid = get_data['streamcomid']
        codEstacion = get_data['stationcode']
        nomEstacion = get_data['stationname']

        '''Merge Data'''

        merged_df = hd.merge_data(sim_df=simulated_df, obs_df=observed_df)

        merged_df2 = hd.merge_data(sim_df=corrected_df, obs_df=observed_df)

        '''Plotting Data'''

        scatter_data = go.Scatter(
            x=merged_df.iloc[:, 0].values,
            y=merged_df.iloc[:, 1].values,
            mode='markers',
            name='original',
            marker=dict(color='#ef553b')
        )

        scatter_data2 = go.Scatter(
            x=merged_df2.iloc[:, 0].values,
            y=merged_df2.iloc[:, 1].values,
            mode='markers',
            name='corrected',
            marker=dict(color='#00cc96')
        )

        min_value = min(min(merged_df.iloc[:, 1].values), min(merged_df.iloc[:, 0].values))
        max_value = max(max(merged_df.iloc[:, 1].values), max(merged_df.iloc[:, 0].values))

        min_value2 = min(min(merged_df2.iloc[:, 1].values), min(merged_df2.iloc[:, 0].values))
        max_value2 = max(max(merged_df2.iloc[:, 1].values), max(merged_df2.iloc[:, 0].values))

        line_45 = go.Scatter(
            x=[min_value, max_value],
            y=[min_value, max_value],
            mode='lines',
            name='45deg line',
            line=dict(color='black')
        )

        slope, intercept, r_value, p_value, std_err = sp.linregress(merged_df.iloc[:, 0].values,
                                                                    merged_df.iloc[:, 1].values)

        slope2, intercept2, r_value2, p_value2, std_err2 = sp.linregress(merged_df2.iloc[:, 0].values,
                                                                         merged_df2.iloc[:, 1].values)

        line_adjusted = go.Scatter(
            x=[min_value, max_value],
            y=[slope * min_value + intercept, slope * max_value + intercept],
            mode='lines',
            name='{0}x + {1} (Original)'.format(str(round(slope, 2)), str(round(intercept, 2))),
            line=dict(color='red')
        )

        line_adjusted2 = go.Scatter(
            x=[min_value, max_value],
            y=[slope2 * min_value + intercept2, slope2 * max_value + intercept2],
            mode='lines',
            name='{0}x + {1} (Corrected)'.format(str(round(slope2, 2)), str(round(intercept2, 2))),
            line=dict(color='green')
        )

        layout = go.Layout(title="Scatter Plot for {0} - {1}".format(codEstacion, nomEstacion),
                           xaxis=dict(title='Simulated', ), yaxis=dict(title='Observed', autorange=True),
                           showlegend=True)

        chart_obj = PlotlyView(
            go.Figure(data=[scatter_data, scatter_data2, line_45, line_adjusted, line_adjusted2], layout=layout))

        context = {
            'gizmo_object': chart_obj,
        }

        print("--- %s seconds scatterPlot ---" % (time.time() - start_time))

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_scatterPlotLogScale(request):
    """
    Get observed data from CEMADEN web site
    Get historic simulations from ERA Interim
    """
    get_data = request.GET

    start_time = time.time()

    try:

        '''Merge Data'''

        merged_df = hd.merge_data(sim_df=simulated_df, obs_df=observed_df)

        merged_df2 = hd.merge_data(sim_df=corrected_df, obs_df=observed_df)

        '''Plotting Data'''

        scatter_data = go.Scatter(
            x=merged_df.iloc[:, 0].values,
            y=merged_df.iloc[:, 1].values,
            mode='markers',
            name='original',
            marker=dict(color='#ef553b')
        )

        scatter_data2 = go.Scatter(
            x=merged_df2.iloc[:, 0].values,
            y=merged_df2.iloc[:, 1].values,
            mode='markers',
            name='corrected',
            marker=dict(color='#00cc96')
        )

        min_value = min(min(merged_df.iloc[:, 1].values), min(merged_df.iloc[:, 0].values))
        max_value = max(max(merged_df.iloc[:, 1].values), max(merged_df.iloc[:, 0].values))

        line_45 = go.Scatter(
            x=[min_value, max_value],
            y=[min_value, max_value],
            mode='lines',
            name='45deg line',
            line=dict(color='black')
        )

        layout = go.Layout(title="Scatter Plot for {0} - {1} (Log Scale)".format(codEstacion, nomEstacion),
                           xaxis=dict(title='Simulated', type='log', ), yaxis=dict(title='Observed', type='log',
                                                                                   autorange=True), showlegend=True)

        chart_obj = PlotlyView(go.Figure(data=[scatter_data, scatter_data2, line_45], layout=layout))

        context = {
            'gizmo_object': chart_obj,
        }

        print("--- %s seconds scatterPlot_log ---" % (time.time() - start_time))

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_volumeAnalysis(request):
    """
    Get observed data from CEMADEN web site
    Get historic simulations from ERA Interim
    """
    get_data = request.GET
    global codEstacion
    global nomEstacion
    global simulated_df
    global observed_df
    global corrected_df

    start_time = time.time()

    try:

        '''Merge Data'''

        merged_df = hd.merge_data(sim_df=simulated_df, obs_df=observed_df)

        merged_df2 = hd.merge_data(sim_df=corrected_df, obs_df=observed_df)

        '''Plotting Data'''

        sim_array = merged_df.iloc[:, 0].values
        obs_array = merged_df.iloc[:, 1].values
        corr_array = merged_df2.iloc[:, 0].values

        sim_volume_dt = sim_array * 0.0864
        obs_volume_dt = obs_array * 0.0864
        corr_volume_dt = corr_array * 0.0864

        sim_volume_cum = []
        obs_volume_cum = []
        corr_volume_cum = []
        sum_sim = 0
        sum_obs = 0
        sum_corr = 0

        for i in sim_volume_dt:
            sum_sim = sum_sim + i
            sim_volume_cum.append(sum_sim)

        for j in obs_volume_dt:
            sum_obs = sum_obs + j
            obs_volume_cum.append(sum_obs)

        for k in corr_volume_dt:
            sum_corr = sum_corr + k
            corr_volume_cum.append(sum_corr)

        observed_volume = go.Scatter(x=merged_df.index, y=obs_volume_cum, name='Observed', )

        simulated_volume = go.Scatter(x=merged_df.index, y=sim_volume_cum, name='Simulated', )

        corrected_volume = go.Scatter(x=merged_df2.index, y=corr_volume_cum, name='Corrected Simulated', )

        layout = go.Layout(
            title='Observed & Simulated Volume at<br> {0} - {1}'.format(codEstacion, nomEstacion),
            xaxis=dict(title='Dates', ), yaxis=dict(title='Volume (Mm<sup>3</sup>)', autorange=True),
            showlegend=True)

        chart_obj = PlotlyView(go.Figure(data=[observed_volume, simulated_volume, corrected_volume], layout=layout))

        context = {
            'gizmo_object': chart_obj,
        }

        print("--- %s seconds volumeAnalysis ---" % (time.time() - start_time))

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def volume_table_ajax(request):
    """Calculates the volumes of the simulated and observed streamflow"""

    get_data = request.GET
    global simulated_df
    global observed_df
    global corrected_df

    start_time = time.time()

    try:

        '''Merge Data'''

        merged_df = hd.merge_data(sim_df=simulated_df, obs_df=observed_df)

        merged_df2 = hd.merge_data(sim_df=corrected_df, obs_df=observed_df)

        '''Plotting Data'''

        sim_array = merged_df.iloc[:, 0].values
        obs_array = merged_df.iloc[:, 1].values
        corr_array = merged_df2.iloc[:, 0].values

        sim_volume = round((integrate.simps(sim_array)) * 0.0864, 3)
        obs_volume = round((integrate.simps(obs_array)) * 0.0864, 3)
        corr_volume = round((integrate.simps(corr_array)) * 0.0864, 3)

        resp = {
            "sim_volume": sim_volume,
            "obs_volume": obs_volume,
            "corr_volume": corr_volume,
        }

        print("--- %s seconds volumeAnalysis_table ---" % (time.time() - start_time))

        return JsonResponse(resp)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def make_table_ajax(request):
    get_data = request.GET
    global simulated_df
    global observed_df
    global corrected_df

    start_time = time.time()

    try:

        # Indexing the metrics to get the abbreviations
        selected_metric_abbr = get_data.getlist("metrics[]", None)

        # print(selected_metric_abbr)

        # Retrive additional parameters if they exist
        # Retrieving the extra optional parameters
        extra_param_dict = {}

        if request.GET.get('mase_m', None) is not None:
            mase_m = float(request.GET.get('mase_m', None))
            extra_param_dict['mase_m'] = mase_m
        else:
            mase_m = 1
            extra_param_dict['mase_m'] = mase_m

        if request.GET.get('dmod_j', None) is not None:
            dmod_j = float(request.GET.get('dmod_j', None))
            extra_param_dict['dmod_j'] = dmod_j
        else:
            dmod_j = 1
            extra_param_dict['dmod_j'] = dmod_j

        if request.GET.get('nse_mod_j', None) is not None:
            nse_mod_j = float(request.GET.get('nse_mod_j', None))
            extra_param_dict['nse_mod_j'] = nse_mod_j
        else:
            nse_mod_j = 1
            extra_param_dict['nse_mod_j'] = nse_mod_j

        if request.GET.get('h6_k_MHE', None) is not None:
            h6_mhe_k = float(request.GET.get('h6_k_MHE', None))
            extra_param_dict['h6_mhe_k'] = h6_mhe_k
        else:
            h6_mhe_k = 1
            extra_param_dict['h6_mhe_k'] = h6_mhe_k

        if request.GET.get('h6_k_AHE', None) is not None:
            h6_ahe_k = float(request.GET.get('h6_k_AHE', None))
            extra_param_dict['h6_ahe_k'] = h6_ahe_k
        else:
            h6_ahe_k = 1
            extra_param_dict['h6_ahe_k'] = h6_ahe_k

        if request.GET.get('h6_k_RMSHE', None) is not None:
            h6_rmshe_k = float(request.GET.get('h6_k_RMSHE', None))
            extra_param_dict['h6_rmshe_k'] = h6_rmshe_k
        else:
            h6_rmshe_k = 1
            extra_param_dict['h6_rmshe_k'] = h6_rmshe_k

        if float(request.GET.get('lm_x_bar', None)) != 1:
            lm_x_bar_p = float(request.GET.get('lm_x_bar', None))
            extra_param_dict['lm_x_bar_p'] = lm_x_bar_p
        else:
            lm_x_bar_p = None
            extra_param_dict['lm_x_bar_p'] = lm_x_bar_p

        if float(request.GET.get('d1_p_x_bar', None)) != 1:
            d1_p_x_bar_p = float(request.GET.get('d1_p_x_bar', None))
            extra_param_dict['d1_p_x_bar_p'] = d1_p_x_bar_p
        else:
            d1_p_x_bar_p = None
            extra_param_dict['d1_p_x_bar_p'] = d1_p_x_bar_p

        '''Merge Data'''
        merged_df = hd.merge_data(sim_df=simulated_df, obs_df=observed_df)

        merged_df2 = hd.merge_data(sim_df=corrected_df, obs_df=observed_df)

        '''Plotting Data'''

        # Creating the Table Based on User Input
        table = hs.make_table(
            merged_dataframe=merged_df,
            metrics=selected_metric_abbr,
            # remove_neg=remove_neg,
            # remove_zero=remove_zero,
            mase_m=extra_param_dict['mase_m'],
            dmod_j=extra_param_dict['dmod_j'],
            nse_mod_j=extra_param_dict['nse_mod_j'],
            h6_mhe_k=extra_param_dict['h6_mhe_k'],
            h6_ahe_k=extra_param_dict['h6_ahe_k'],
            h6_rmshe_k=extra_param_dict['h6_rmshe_k'],
            d1_p_obs_bar_p=extra_param_dict['d1_p_x_bar_p'],
            lm_x_obs_bar_p=extra_param_dict['lm_x_bar_p'],
            # seasonal_periods=all_date_range_list
        )
        table = table.round(decimals=2)
        table_html = table.transpose()
        table_html = table_html.to_html(classes="table table-hover table-striped").replace('border="1"', 'border="0"')

        # Creating the Table Based on User Input
        table2 = hs.make_table(
            merged_dataframe=merged_df2,
            metrics=selected_metric_abbr,
            # remove_neg=remove_neg,
            # remove_zero=remove_zero,
            mase_m=extra_param_dict['mase_m'],
            dmod_j=extra_param_dict['dmod_j'],
            nse_mod_j=extra_param_dict['nse_mod_j'],
            h6_mhe_k=extra_param_dict['h6_mhe_k'],
            h6_ahe_k=extra_param_dict['h6_ahe_k'],
            h6_rmshe_k=extra_param_dict['h6_rmshe_k'],
            d1_p_obs_bar_p=extra_param_dict['d1_p_x_bar_p'],
            lm_x_obs_bar_p=extra_param_dict['lm_x_bar_p'],
            # seasonal_periods=all_date_range_list
        )
        table2 = table2.round(decimals=2)
        table_html2 = table2.transpose()
        table_html2 = table_html2.to_html(classes="table table-hover table-striped").replace('border="1"', 'border="0"')

        table2 = table2.rename(index={'Full Time Series': 'Corrected Full Time Series'})
        table = table.rename(index={'Full Time Series': 'Original Full Time Series'})
        table_html2 = table2.transpose()
        table_html1 = table.transpose()

        table_final = pd.merge(table_html1, table_html2, right_index=True, left_index=True)

        table_final_html = table_final.to_html(classes="table table-hover table-striped",
                                               table_id="corrected_1").replace('border="1"', 'border="0"')

        print("--- %s seconds metrics_table ---" % (time.time() - start_time))

        return HttpResponse(table_final_html)

    except Exception:
        traceback.print_exc()
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_units_title(unit_type):
    """
    Get the title for units
    """
    units_title = "m"
    if unit_type == 'english':
        units_title = "ft"
    return units_title


def get_time_series(request):
    get_data = request.GET
    global comid
    global codEstacion
    global nomEstacion
    global observed_df
    global forecast_df
    global forecast_record

    start_time = time.time()

    try:

        hydroviewer_figure = geoglows.plots.forecast_stats(stats=forecast_df, titles={'Station': nomEstacion + '-' + str(codEstacion), 'Reach ID': comid})

        x_vals = (forecast_df.index[0], forecast_df.index[len(forecast_df.index) - 1],
                  forecast_df.index[len(forecast_df.index) - 1], forecast_df.index[0])
        max_visible = max(forecast_df.max())

        '''Getting forecast record'''

        try:

            if len(forecast_record.index) > 0:
                hydroviewer_figure.add_trace(go.Scatter(
                    name='1st days forecasts',
                    x=forecast_record.index,
                    y=forecast_record.iloc[:, 0].values,
                    line=dict(
                        color='#FFA15A',
                    )
                ))

            if 'x_vals' in locals():
                x_vals = (forecast_record.index[0], forecast_df.index[len(forecast_df.index) - 1],
                          forecast_df.index[len(forecast_df.index) - 1], forecast_record.index[0])
            else:
                x_vals = (forecast_record.index[0], forecast_df.index[len(forecast_df.index) - 1],
                          forecast_df.index[len(forecast_df.index) - 1], forecast_record.index[0])
                max_visible = max(forecast_record.max(), max_visible)

        except:
            print('There is no forecast record')


        '''Getting real time observed data'''

        try:

            tz = pytz.timezone('Brazil/East')
            hoy = dt.datetime.now(tz)
            ini_date = hoy - relativedelta(months=7)

            anyo = hoy.year
            mes = hoy.month
            dia = hoy.day

            if dia < 10:
                DD = '0' + str(dia)
            else:
                DD = str(dia)

            if mes < 10:
                MM = '0' + str(mes)
            else:
                MM = str(mes)

            YYYY = str(anyo)

            ini_anyo = ini_date.year
            ini_mes = ini_date.month
            ini_dia = ini_date.day

            if ini_dia < 10:
                ini_DD = '0' + str(ini_dia)
            else:
                ini_DD = str(ini_dia)

            if ini_mes < 10:
                ini_MM = '0' + str(ini_mes)
            else:
                ini_MM = str(ini_mes)

            ini_YYYY = str(ini_anyo)

            url = 'http://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao={0}&DataInicio={1}/{2}/{3}&DataFim={4}/{5}/{6}'.format(codEstacion, ini_DD, ini_MM, ini_YYYY, DD, MM, YYYY)
            datos = requests.get(url).content
            sites_dict = xmltodict.parse(datos)
            sites_json_object = json.dumps(sites_dict)
            sites_json = json.loads(sites_json_object)

            datos_c = sites_json["DataTable"]["diffgr:diffgram"]["DocumentElement"]["DadosHidrometereologicos"]

            list_val_vazao = []
            list_date_vazao = []

            for dat in datos_c:
                list_val_vazao.append(dat["Vazao"])
                list_date_vazao.append(dat["DataHora"])

            pairs = [list(a) for a in zip(list_date_vazao, list_val_vazao)]
            observed_rt = pd.DataFrame(pairs, columns=['Datetime', 'Streamflow (m3/s)'])
            observed_rt.set_index('Datetime', inplace=True)
            observed_rt.index = pd.to_datetime(observed_rt.index)
            observed_rt.dropna(inplace=True)

            observed_rt.index = observed_rt.index.tz_localize('UTC')
            observed_rt = observed_rt.loc[observed_rt.index >= pd.to_datetime(forecast_df.index[0] - dt.timedelta(days=8))]
            observed_rt = observed_rt.dropna()

            if len(observed_rt.index) > 0:
                hydroviewer_figure.add_trace(go.Scatter(
                    name='Observed Streamflow',
                    x=observed_rt.index,
                    y=observed_rt.iloc[:, 0].values,
                    line=dict(
                        color='green',
                    )
                ))

            if 'forecast_record' in locals():
                x_vals = x_vals
            else:
                x_vals = (observed_rt.index[0], forecast_df.index[len(forecast_df.index) - 1], forecast_df.index[len(forecast_df.index) - 1], observed_rt.index[0])

            max_visible = max(observed_rt.max(), max_visible)

        except:
            print('Not observed data for the selected station')

        '''Getting Return Periods'''
        try:
            rperiods = geoglows.streamflow.return_periods(comid)

            r2 = int(rperiods.iloc[0]['return_period_2'])

            colors = {
                '2 Year': 'rgba(254, 240, 1, .4)',
                '5 Year': 'rgba(253, 154, 1, .4)',
                '10 Year': 'rgba(255, 56, 5, .4)',
                '20 Year': 'rgba(128, 0, 246, .4)',
                '25 Year': 'rgba(255, 0, 0, .4)',
                '50 Year': 'rgba(128, 0, 106, .4)',
                '100 Year': 'rgba(128, 0, 246, .4)',
            }

            if max_visible > r2:
                visible = True
                hydroviewer_figure.for_each_trace(
                    lambda trace: trace.update(visible=True) if trace.name == "Maximum & Minimum Flow" else (),
                )
            else:
                visible = 'legendonly'
                hydroviewer_figure.for_each_trace(
                    lambda trace: trace.update(visible=True) if trace.name == "Maximum & Minimum Flow" else (),
                )

            def template(name, y, color, fill='toself'):
                return go.Scatter(
                    name=name,
                    x=x_vals,
                    y=y,
                    legendgroup='returnperiods',
                    fill=fill,
                    visible=visible,
                    line=dict(color=color, width=0))

            r5 = int(rperiods.iloc[0]['return_period_5'])
            r10 = int(rperiods.iloc[0]['return_period_10'])
            r25 = int(rperiods.iloc[0]['return_period_25'])
            r50 = int(rperiods.iloc[0]['return_period_50'])
            r100 = int(rperiods.iloc[0]['return_period_100'])

            hydroviewer_figure.add_trace(template('Return Periods', (r100 * 0.05, r100 * 0.05, r100 * 0.05, r100 * 0.05), 'rgba(0,0,0,0)', fill='none'))
            hydroviewer_figure.add_trace(template(f'2 Year: {r2}', (r2, r2, r5, r5), colors['2 Year']))
            hydroviewer_figure.add_trace(template(f'5 Year: {r5}', (r5, r5, r10, r10), colors['5 Year']))
            hydroviewer_figure.add_trace(template(f'10 Year: {r10}', (r10, r10, r25, r25), colors['10 Year']))
            hydroviewer_figure.add_trace(template(f'25 Year: {r25}', (r25, r25, r50, r50), colors['25 Year']))
            hydroviewer_figure.add_trace(template(f'50 Year: {r50}', (r50, r50, r100, r100), colors['50 Year']))
            hydroviewer_figure.add_trace(template(f'100 Year: {r100}', (r100, r100, max(r100 + r100 * 0.05, max_visible), max(r100 + r100 * 0.05, max_visible)), colors['100 Year']))

        except:
            print('There is no return periods for the desired stream')

        chart_obj = PlotlyView(hydroviewer_figure)

        context = {
            'gizmo_object': chart_obj,
        }

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected reach.'})


def get_time_series_bc(request):
    get_data = request.GET
    global comid
    global codEstacion
    global nomEstacion
    global corrected_df
    global forecast_df
    global fixed_stats
    global forecast_record
    global fixed_records

    try:

        hydroviewer_figure = geoglows.plots.forecast_stats(stats=fixed_stats, titles={'Station': nomEstacion + '-' + str(codEstacion), 'Reach ID': comid, 'bias_corrected': True})

        x_vals = (fixed_stats.index[0], fixed_stats.index[len(fixed_stats.index) - 1], fixed_stats.index[len(fixed_stats.index) - 1], fixed_stats.index[0])
        max_visible = max(fixed_stats.max())

        '''Getting forecast record'''

        try:
            if len(fixed_records.index) > 0:
                hydroviewer_figure.add_trace(go.Scatter(
                    name='1st days forecasts',
                    x=fixed_records.index,
                    y=fixed_records.iloc[:, 0].values,
                    line=dict(
                        color='#FFA15A',
                    )
                ))

            if 'x_vals' in locals():
                x_vals = (fixed_records.index[0], fixed_stats.index[len(fixed_stats.index) - 1], fixed_stats.index[len(fixed_stats.index) - 1], fixed_records.index[0])
            else:
                x_vals = (fixed_records.index[0], fixed_stats.index[len(fixed_stats.index) - 1], fixed_stats.index[len(fixed_stats.index) - 1], fixed_records.index[0])

            max_visible = max(fixed_records.max(), max_visible)

        except:
            print('There is no forecast record')

        '''Getting real time observed data'''

        try:

            tz = pytz.timezone('Brazil/East')
            hoy = dt.datetime.now(tz)
            ini_date = hoy - relativedelta(months=7)

            anyo = hoy.year
            mes = hoy.month
            dia = hoy.day

            if dia < 10:
                DD = '0' + str(dia)
            else:
                DD = str(dia)

            if mes < 10:
                MM = '0' + str(mes)
            else:
                MM = str(mes)

            YYYY = str(anyo)

            ini_anyo = ini_date.year
            ini_mes = ini_date.month
            ini_dia = ini_date.day

            if ini_dia < 10:
                ini_DD = '0' + str(ini_dia)
            else:
                ini_DD = str(ini_dia)

            if ini_mes < 10:
                ini_MM = '0' + str(ini_mes)
            else:
                ini_MM = str(ini_mes)

            ini_YYYY = str(ini_anyo)

            url = 'http://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao={0}&DataInicio={1}/{2}/{3}&DataFim={4}/{5}/{6}'.format(codEstacion, ini_DD, ini_MM, ini_YYYY, DD, MM, YYYY)
            datos = requests.get(url).content
            sites_dict = xmltodict.parse(datos)
            sites_json_object = json.dumps(sites_dict)
            sites_json = json.loads(sites_json_object)

            datos_c = sites_json["DataTable"]["diffgr:diffgram"]["DocumentElement"]["DadosHidrometereologicos"]

            list_val_vazao = []
            list_date_vazao = []

            for dat in datos_c:
                list_val_vazao.append(dat["Vazao"])
                list_date_vazao.append(dat["DataHora"])

            pairs = [list(a) for a in zip(list_date_vazao, list_val_vazao)]
            observed_rt = pd.DataFrame(pairs, columns=['Datetime', 'Streamflow (m3/s)'])
            observed_rt.set_index('Datetime', inplace=True)
            observed_rt.index = pd.to_datetime(observed_rt.index)
            observed_rt.dropna(inplace=True)

            observed_rt.index = observed_rt.index.tz_localize('UTC')
            observed_rt = observed_rt.loc[observed_rt.index >= pd.to_datetime(forecast_df.index[0] - dt.timedelta(days=7))]
            observed_rt = observed_rt.dropna()

            if len(observed_rt.index) > 0:
                hydroviewer_figure.add_trace(go.Scatter(
                    name='Observed Streamflow',
                    x=observed_rt.index,
                    y=observed_rt.iloc[:, 0].values,
                    line=dict(
                        color='green',
                    )
                ))

            if 'forecast_record' in locals():
                x_vals = x_vals
            else:
                x_vals = (observed_rt.index[0], forecast_df.index[len(forecast_df.index) - 1], forecast_df.index[len(forecast_df.index) - 1], observed_rt.index[0])

            max_visible = max(observed_rt.max(), max_visible)

        except:
            print('Not observed data for the selected station')

        '''Getting Corrected Return Periods'''
        max_annual_flow = corrected_df.groupby(corrected_df.index.strftime("%Y")).max()
        mean_value = np.mean(max_annual_flow.iloc[:, 0].values)
        std_value = np.std(max_annual_flow.iloc[:, 0].values)

        return_periods = [100, 50, 25, 10, 5, 2]

        def gumbel_1(std: float, xbar: float, rp: int or float) -> float:
            """
            Solves the Gumbel Type I probability distribution function (pdf) = exp(-exp(-b)) where b is the covariate. Provide
            the standard deviation and mean of the list of annual maximum flows. Compare scipy.stats.gumbel_r
            Args:
                std (float): the standard deviation of the series
                xbar (float): the mean of the series
                rp (int or float): the return period in years
            Returns:
                float, the flow corresponding to the return period specified
            """
            # xbar = statistics.mean(year_max_flow_list)
            # std = statistics.stdev(year_max_flow_list, xbar=xbar)
            return -math.log(-math.log(1 - (1 / rp))) * std * .7797 + xbar - (.45 * std)

        return_periods_values = []

        for rp in return_periods:
            return_periods_values.append(gumbel_1(std_value, mean_value, rp))

        d = {'rivid': [comid], 'return_period_100': [return_periods_values[0]], 'return_period_50': [return_periods_values[1]], 'return_period_25': [return_periods_values[2]], 'return_period_10': [return_periods_values[3]], 'return_period_5': [return_periods_values[4]], 'return_period_2': [return_periods_values[5]]}
        rperiods = pd.DataFrame(data=d)
        rperiods.set_index('rivid', inplace=True)

        r2 = int(rperiods.iloc[0]['return_period_2'])

        colors = {
            '2 Year': 'rgba(254, 240, 1, .4)',
            '5 Year': 'rgba(253, 154, 1, .4)',
            '10 Year': 'rgba(255, 56, 5, .4)',
            '20 Year': 'rgba(128, 0, 246, .4)',
            '25 Year': 'rgba(255, 0, 0, .4)',
            '50 Year': 'rgba(128, 0, 106, .4)',
            '100 Year': 'rgba(128, 0, 246, .4)',
        }

        if max_visible > r2:
            visible = True
            hydroviewer_figure.for_each_trace(
                lambda trace: trace.update(visible=True) if trace.name == "Maximum & Minimum Flow" else (),
            )
        else:
            visible = 'legendonly'
            hydroviewer_figure.for_each_trace(
                lambda trace: trace.update(visible=True) if trace.name == "Maximum & Minimum Flow" else (),
            )

        def template(name, y, color, fill='toself'):
            return go.Scatter(
                name=name,
                x=x_vals,
                y=y,
                legendgroup='returnperiods',
                fill=fill,
                visible=visible,
                line=dict(color=color, width=0))

        r5 = int(rperiods.iloc[0]['return_period_5'])
        r10 = int(rperiods.iloc[0]['return_period_10'])
        r25 = int(rperiods.iloc[0]['return_period_25'])
        r50 = int(rperiods.iloc[0]['return_period_50'])
        r100 = int(rperiods.iloc[0]['return_period_100'])

        hydroviewer_figure.add_trace(template('Return Periods', (r100 * 0.05, r100 * 0.05, r100 * 0.05, r100 * 0.05), 'rgba(0,0,0,0)', fill='none'))
        hydroviewer_figure.add_trace(template(f'2 Year: {r2}', (r2, r2, r5, r5), colors['2 Year']))
        hydroviewer_figure.add_trace(template(f'5 Year: {r5}', (r5, r5, r10, r10), colors['5 Year']))
        hydroviewer_figure.add_trace(template(f'10 Year: {r10}', (r10, r10, r25, r25), colors['10 Year']))
        hydroviewer_figure.add_trace(template(f'25 Year: {r25}', (r25, r25, r50, r50), colors['25 Year']))
        hydroviewer_figure.add_trace(template(f'50 Year: {r50}', (r50, r50, r100, r100), colors['50 Year']))
        hydroviewer_figure.add_trace(template(f'100 Year: {r100}', (r100, r100, max(r100 + r100 * 0.05, max_visible), max(r100 + r100 * 0.05, max_visible)), colors['100 Year']))

        chart_obj = PlotlyView(hydroviewer_figure)

        context = {
            'gizmo_object': chart_obj,
        }

        return render(request, 'historical_validation_tool_brazil/gizmo_ajax.html', context)

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected reach.'})


def get_available_dates(request):
    get_data = request.GET

    global watershed
    global subbasin
    global comid
    res = requests.get('https://geoglows.ecmwf.int/api/AvailableDates/?region=' + watershed + '-' + subbasin, verify=False)

    data = res.json()

    dates_array = (data.get('available_dates'))

    dates = []

    for date in dates_array:
        if len(date) == 10:
            date_mod = date + '000'
            date_f = dt.datetime.strptime(date_mod, '%Y%m%d.%H%M').strftime('%Y-%m-%d %H:%M')
        else:
            date_f = dt.datetime.strptime(date, '%Y%m%d.%H%M').strftime('%Y-%m-%d')
            date = date[:-3]
        dates.append([date_f, date, watershed, subbasin, comid])

    dates.append(['Select Date', dates[-1][1]])
    dates.reverse()

    return JsonResponse({
        "success": "Data analysis complete!",
        "available_dates": json.dumps(dates)
    })


def get_observed_discharge_csv(request):
    """
    Get observed data from CEMADEN website
    """

    get_data = request.GET
    global observed_df
    global codEstacion
    global nomEstacion

    try:

        pairs = [list(a) for a in zip(observed_df.index, observed_df.iloc[:,0])]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=observed_discharge_{0}.csv'.format(codEstacion)

        writer = csv_writer(response)
        writer.writerow(['datetime', 'flow (m3/s)'])

        for row_data in pairs:
            writer.writerow(row_data)

        return response

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'An unknown error occurred while retrieving the Discharge Data.'})


def get_simulated_discharge_csv(request):
    """
    Get historic simulations from ERA Interim
    """
    get_data = request.GET
    global comid
    global codEstacion
    global nomEstacion
    global simulated_df

    try:

        pairs = [list(a) for a in zip(simulated_df.index, simulated_df.iloc[:, 0])]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=simulated_discharge_{0}.csv'.format(codEstacion)

        writer = csv_writer(response)
        writer.writerow(['datetime', 'flow (m3/s)'])

        for row_data in pairs:
            writer.writerow(row_data)

        return response

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'An unknown error occurred while retrieving the Discharge Data.'})


def get_simulated_bc_discharge_csv(request):
    """
    Get historic simulations from ERA Interim
    """

    get_data = request.GET
    global comid
    global codEstacion
    global nomEstacion
    global observed_df
    global simulated_df
    global corrected_df

    try:

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=corrected_simulated_discharge_{0}.csv'.format(
            codEstacion)

        corrected_df.to_csv(encoding='utf-8', header=True, path_or_buf=response)

        return response

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'An unknown error occurred while retrieving the Discharge Data.'})


def get_forecast_data_csv(request):
    """""
    Returns Forecast data as csv
    """""

    get_data = request.GET
    global watershed
    global subbasin
    global comid
    global forecast_df

    try:

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=streamflow_forecast_{0}_{1}_{2}.csv'.format(watershed, subbasin, comid)

        forecast_df.to_csv(encoding='utf-8', header=True, path_or_buf=response)

        return response

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No forecast data found.'})


def get_forecast_bc_data_csv(request):
    """""
    Returns Forecast data as csv
    """""

    get_data = request.GET
    global watershed
    global subbasin
    global comid
    global forecast_df
    global fixed_stats

    try:

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=corrected_streamflow_forecast_{0}_{1}_{2}.csv'.format(watershed, subbasin, comid)

        fixed_stats.to_csv(encoding='utf-8', header=True, path_or_buf=response)

        return response

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No forecast data found.'})