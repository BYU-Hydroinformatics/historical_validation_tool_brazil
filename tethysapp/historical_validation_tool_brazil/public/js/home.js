// Getting the csrf token
function get_requestData(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname,
  startdate
) {
  getdata = {
    watershed: watershed,
    subbasin: subbasin,
    streamcomid: streamcomid,
    stationcode: stationcode,
    stationname: stationname,
  };
  $.ajax({
    url: 'get-request-data',
    type: 'GET',
    data: getdata,
    error: function () {
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>'
      );
      $('#info').removeClass('d-none');
      console.log(e);
      $('#hydrographs-loading').addClass('d-none');
      $('#dailyAverages-loading').addClass('d-none');
      $('#monthlyAverages-loading').addClass('d-none');
      $('#scatterPlot-loading').addClass('d-none');
      $('#scatterPlotLogScale-loading').addClass('d-none');
      $('#volumeAnalysis-loading').addClass('d-none');
      $('#forecast-loading').addClass('d-none');
      $('#forecast-bc-loading').addClass('d-none');
      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      console.log(data);
      get_hydrographs(
        watershed,
        subbasin,
        streamcomid,
        stationcode,
        stationname,
        startdate
      );
    },
  });
}

// Getting the csrf token
let csrftoken = Cookies.get('csrftoken');

function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

$.ajaxSetup({
  beforeSend: function (xhr, settings) {
    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
      xhr.setRequestHeader('X-CSRFToken', csrftoken);
    }
  },
});

var feature_layer;
var current_layer;
var map;
var wmsLayer;
var wmsLayer2;

let $loading = $('#view-file-loading');
var m_downloaded_historical_streamflow = false;

function toggleAcc(layerID) {
  let layer = wms_layers[layerID];
  if (document.getElementById(`wmsToggle${layerID}`).checked) {
    // Turn the layer and legend on
    layer.setVisible(true);
    $('#wmslegend' + layerID).show(200);
  } else {
    layer.setVisible(false);
    $('#wmslegend' + layerID).hide(200);
  }
}

function init_map() {
  var base_layer = new ol.layer.Tile({
    source: new ol.source.OSM({}),
  });

  var streams = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      //url: JSON.parse($('#geoserver_endpoint').val())[0].replace(/\/$/, "") + JSON.parse($('#geoserver_endpoint').val())[1] + '/wms',
      url: 'https://geoserver.hydroshare.org/geoserver/HS-11765271903a45d483416ce57bf8c710/wms',
      params: { LAYERS: 'south_america-brazil-geoglows-drainage_line' },
      serverType: 'geoserver',
      crossOrigin: 'Anonymous',
    }),
    opacity: 0.5,
  });

  wmsLayer = streams;

  var stations = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      //url: JSON.parse($('#geoserver_endpoint').val())[0].replace(/\/$/, "") + JSON.parse($('#geoserver_endpoint').val())[1] + '/wms',
      url: 'https://geoserver.hydroshare.org/geoserver/HS-11765271903a45d483416ce57bf8c710/wms',
      params: { LAYERS: 'Brazil_Stations' },
      serverType: 'geoserver',
      crossOrigin: 'Anonymous',
    }),
  });

  wmsLayer2 = stations;

  feature_layer = stations;

  map = new ol.Map({
    target: 'map',
    layers: [base_layer, streams, stations],
    view: new ol.View({
      center: ol.proj.fromLonLat([-55, -10]),
      zoom: 3,
    }),
  });
}

//let ajax_url = JSON.parse($('#geoserver_endpoint').val())[0].replace(/\/$/, "") + JSON.parse($('#geoserver_endpoint').val())[1] + '/wfs?request=GetCapabilities';
let ajax_url =
  'https://geoserver.hydroshare.org/geoserver/wfs?request=GetCapabilities';

let capabilities = $.ajax(ajax_url, {
  type: 'GET',
  data: {
    service: 'WFS',
    version: '1.0.0',
    request: 'GetCapabilities',
    outputFormat: 'text/javascript',
  },
  success: function () {
    let x = capabilities.responseText
      .split('<FeatureTypeList>')[1]
      //.split('brazil_hydroviewer:south_america-brazil-geoglows-drainage_line')[1]
      .split(
        'HS-11765271903a45d483416ce57bf8c710:south_america-brazil-geoglows-drainage_line'
      )[1]
      .split('LatLongBoundingBox ')[1]
      .split('/></FeatureType>')[0];

    let minx = Number(x.split('"')[1]);
    let miny = Number(x.split('"')[3]);
    let maxx = Number(x.split('"')[5]);
    let maxy = Number(x.split('"')[7]);

    minx = minx + 2;
    miny = miny + 2;
    maxx = maxx - 2;
    maxy = maxy - 2;

    let extent = ol.proj
      .transform([minx, miny], 'EPSG:4326', 'EPSG:3857')
      .concat(ol.proj.transform([maxx, maxy], 'EPSG:4326', 'EPSG:3857'));

    map.getView().fit(extent, map.getSize());
  },
});

function get_hydrographs(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname,
  startdate
) {
  $('#hydrographs-loading').removeClass('d-none');
  m_downloaded_historical_streamflow = true;
  $.ajax({
    url: 'get-hydrographs',
    type: 'GET',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
    },
    error: function () {
      $('#hydrographs-loading').addClass('d-none');
      console.log(e);
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_hydrographs in');
        $('#hydrographs-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //                $('#obsdates').removeClass('d-none');
        $loading.addClass('d-none');
        $('#hydrographs-chart').removeClass('d-none');
        $('#hydrographs-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#hydrographs-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#hydrographs-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });

        var params_obs = {
          watershed: watershed,
          subbasin: subbasin,
          streamcomid: streamcomid,
          stationcode: stationcode,
          stationname: stationname,
        };

        $('#submit-download-observed-discharge').attr({
          target: '_blank',
          href: 'get-observed-discharge-csv?' + jQuery.param(params_obs),
        });

        $('#download_observed_discharge').removeClass('d-none');

        var params_sim = {
          watershed: watershed,
          subbasin: subbasin,
          streamcomid: streamcomid,
          stationcode: stationcode,
          stationname: stationname,
        };

        $('#submit-download-simulated-discharge').attr({
          target: '_blank',
          href: 'get-simulated-discharge-csv?' + jQuery.param(params_sim),
        });

        $('#download_simulated_discharge').removeClass('d-none');

        var params_sim_bc = {
          watershed: watershed,
          subbasin: subbasin,
          streamcomid: streamcomid,
          stationcode: stationcode,
          stationname: stationname,
        };

        $('#submit-download-simulated-bc-discharge').attr({
          target: '_blank',
          href: 'get-simulated-bc-discharge-csv?' + jQuery.param(params_sim_bc),
        });

        $('#download_simulated_bc_discharge').removeClass('d-none');

        get_dailyAverages(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname
        );
        get_monthlyAverages(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname
        );
        get_scatterPlot(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname
        );
        get_scatterPlotLogScale(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname
        );
        get_volumeAnalysis(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname
        );
        createVolumeTable(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname
        );
        makeDefaultTable(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname
        );
        get_time_series(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname,
          startdate
        );
      } else if (data.error) {
        $('#hydrographs-loading').addClass('d-none');
        console.log(data.error);
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_hydrographs out');
    },
  });
}

function get_dailyAverages(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname
) {
  $('#dailyAverages-loading').removeClass('d-none');
  m_downloaded_historical_streamflow = true;
  $.ajax({
    url: 'get-dailyAverages',
    type: 'GET',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
    },
    error: function () {
      console.log(e);
      $('#dailyAverages-loading').addClass('d-none');
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_dailyAverages in');
        $('#dailyAverages-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //                $('#obsdates').removeClass('d-none');
        $loading.addClass('d-none');
        $('#dailyAverages-chart').removeClass('d-none');
        $('#dailyAverages-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#dailyAverages-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#dailyAverages-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });
      } else if (data.error) {
        console.log(data.error);
        $('#dailyAverages-loading').addClass('d-none');
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_dailyAverages out');
    },
  });
}

function get_monthlyAverages(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname
) {
  $('#monthlyAverages-loading').removeClass('d-none');
  m_downloaded_historical_streamflow = true;
  $.ajax({
    url: 'get-monthlyAverages',
    type: 'GET',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
    },
    error: function () {
      $('#monthlyAverages-loading').addClass('d-none');
      console.log(e);
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_monthlyAverages in');
        $('#monthlyAverages-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //                $('#obsdates').removeClass('d-none');
        $loading.addClass('d-none');
        $('#monthlyAverages-chart').removeClass('d-none');
        $('#monthlyAverages-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#monthlyAverages-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#monthlyAverages-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });
      } else if (data.error) {
        console.log(data.error);
        $('#monthlyAverages-loading').addClass('d-none');
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_monthlyAverages out');
    },
  });
}

function get_scatterPlot(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname
) {
  $('#scatterPlot-loading').removeClass('d-none');
  m_downloaded_historical_streamflow = true;
  $.ajax({
    url: 'get-scatterPlot',
    type: 'GET',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
    },
    error: function () {
      console.log(e);
      $('#scatterPlot-loading').addClass('d-none');
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_scatterPlot in');
        $('#scatterPlot-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //                $('#obsdates').removeClass('d-none');
        $loading.addClass('d-none');
        $('#scatterPlot-chart').removeClass('d-none');
        $('#scatterPlot-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#scatterPlot-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#scatterPlot-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });
      } else if (data.error) {
        console.log(data.error);
        $('#scatterPlot-loading').addClass('d-none');
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_scatterPlot out');
    },
  });
}

function get_scatterPlotLogScale(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname
) {
  $('#scatterPlotLogScale-loading').removeClass('d-none');
  m_downloaded_historical_streamflow = true;
  $.ajax({
    url: 'get-scatterPlotLogScale',
    type: 'GET',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
    },
    error: function () {
      $('#scatterPlotLogScale-loading').addClass('d-none');
      console.log(e);
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_scatterPlotLogScale in');
        $('#scatterPlotLogScale-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //                $('#obsdates').removeClass('d-none');
        $loading.addClass('d-none');
        $('#scatterPlotLogScale-chart').removeClass('d-none');
        $('#scatterPlotLogScale-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#scatterPlotLogScale-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#scatterPlotLogScale-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });
      } else if (data.error) {
        $('#scatterPlotLogScale-loading').addClass('d-none');
        console.log(data.error);
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_scatterPlotLogScale out');
    },
  });
}

function get_volumeAnalysis(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname
) {
  $('#volumeAnalysis-loading').removeClass('d-none');
  m_downloaded_historical_streamflow = true;
  $.ajax({
    url: 'get-volumeAnalysis',
    type: 'GET',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
    },
    error: function () {
      console.log(e);
      $('#volumeAnalysis-loading').addClass('d-none');
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_volumeAnalysis in');
        $('#volumeAnalysis-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //                $('#obsdates').removeClass('d-none');
        $loading.addClass('d-none');
        $('#volumeAnalysis-chart').removeClass('d-none');
        $('#volumeAnalysis-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#volumeAnalysis-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#volumeAnalysis-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });
      } else if (data.error) {
        console.log(data.error);
        $('#volumeAnalysis-loading').addClass('d-none');
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_volumeAnalysis out');
    },
  });
}

// Ajax for Volume Table
function createVolumeTable(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname
) {
  $('#volumeAnalysis-loading').removeClass('d-none');
  m_downloaded_historical_streamflow = true;
  $.ajax({
    url: 'volume-table-ajax/', // the endpoint
    type: 'GET',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
    },

    // handle a successful response
    success: function (resp) {
      //console.log(resp);
      let obs_volume = resp['obs_volume']
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,');
      let sim_volume = resp['sim_volume']
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,');
      let corr_volume = resp['corr_volume']
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,');
      $('#volume_table_div').show();
      $('#volume_table').html(`<table class="table table-hover table-striped">\
                                        <thead>\
                                          <tr>\
                                            <th>Observed Data Volume (Mm<sup>3</sup>)</th>\
                                            <th>Simulated Data Volume (Mm<sup>3</sup>)</th>\
                                            <th>Corrected Simulated Data Volume (Mm<sup>3</sup>)</th>\
                                          </tr>\
                                        </thead>\
                                        <tbody>\
                                          <tr>\
                                            <td>${obs_volume}</td>\
                                            <td>${sim_volume}</td>\
                                            <td>${corr_volume}</td>\
                                          </tr>\
                                        </tbody>\
                                      </table>`);
    },

    // handle a non-successful response
    error: function (xhr, errmsg, err) {
      $('#volumeAnalysis-loading').addClass('d-none');
      console.log(err);
      $('#results').html(
        "<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " +
          errmsg +
          '.</div>'
      ); // add the error to the dom
      console.log(xhr.status + ': ' + xhr.responseText); // provide a bit more info about the error to the console
    },
  });
}

function map_events() {
  map.on('pointermove', function (evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var hit = map.forEachLayerAtPixel(pixel, function (layer) {
      if (layer == feature_layer) {
        current_layer = layer;
        return true;
      }
    });
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  });

  map.on('singleclick', function (evt) {
    if (map.getTargetElement().style.cursor == 'pointer') {
      var view = map.getView();
      var viewResolution = view.getResolution();
      var wms_url = current_layer
        .getSource()
        .getGetFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          view.getProjection(),
          { INFO_FORMAT: 'application/json' }
        );

      if (wms_url) {
        $('#obsgraph').modal('show');
        $('#hydrographs-chart').addClass('d-none');
        $('#dailyAverages-chart').addClass('d-none');
        $('#monthlyAverages-chart').addClass('d-none');
        $('#scatterPlot-chart').addClass('d-none');
        $('#scatterPlotLogScale-chart').addClass('d-none');
        $('#volumeAnalysis-chart').addClass('d-none');
        $('#forecast-chart').addClass('d-none');
        $('#forecast-bc-chart').addClass('d-none');
        $('#hydrographs-loading').removeClass('d-none');
        $('#dailyAverages-loading').removeClass('d-none');
        $('#monthlyAverages-loading').removeClass('d-none');
        $('#scatterPlot-loading').removeClass('d-none');
        $('#scatterPlotLogScale-loading').removeClass('d-none');
        $('#volumeAnalysis-loading').removeClass('d-none');
        $('#forecast-loading').removeClass('d-none');
        $('#forecast-bc-loading').removeClass('d-none');
        $('#station-info').empty();
        $('#download_observed_discharge').addClass('d-none');
        $('#download_simulated_discharge').addClass('d-none');
        $('#download_simulated_bc_discharge').addClass('d-none');
        $('#download_forecast').addClass('d-none');
        $('#download_forecast_bc').addClass('d-none');

        $.ajax({
          type: 'GET',
          url: wms_url,
          dataType: 'json',
          success: function (result) {
            watershed = 'south_america'; //OJO buscar como hacerla generica
            //subbasin = 'continental' //OJO buscar como hacerla generica
            subbasin = 'geoglows'; //OJO buscar como hacerla generica
            var startdate = '';
            stationcode = result['features'][0]['properties']['CodEstacao'];
            stationname = result['features'][0]['properties']['NomeEstaca'];
            //streamcomid = result["features"][0]["properties"]["COMID"];
            streamcomid = result['features'][0]['properties']['new_COMID'];
            stream = result['features'][0]['properties']['NomeRio'];
            $('#station-info').append(
              '<h3 id="Station-Name-Tab">Current Station: ' +
                stationname +
                '</h3><h5 id="Station-Code-Tab">Station Code: ' +
                stationcode +
                '</h3><h5 id="COMID-Tab">Station COMID: ' +
                streamcomid +
                '</h5><h5>Stream: ' +
                stream
            );
            get_requestData(
              watershed,
              subbasin,
              streamcomid,
              stationcode,
              stationname,
              startdate
            );
          },
          error: function (e) {
            console.log(e);
            $('#hydrographs-loading').addClass('d-none');
            $('#dailyAverages-loading').addClass('d-none');
            $('#monthlyAverages-loading').addClass('d-none');
            $('#scatterPlot-loading').addClass('d-none');
            $('#scatterPlotLogScale-loading').addClass('d-none');
            $('#volumeAnalysis-loading').addClass('d-none');
            $('#forecast-loading').addClass('d-none');
            $('#forecast-bc-loading').addClass('d-none');
          },
        });
      }
    }
  });
}

function resize_graphs() {
  $('#hydrographs_tab_link').click(function () {
    Plotly.Plots.resize($('#hydrographs-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#hydrographs-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
  });
  $('#visualAnalysis_tab_link').click(function () {
    Plotly.Plots.resize($('#dailyAverages-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#dailyAverages-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
    Plotly.Plots.resize($('#monthlyAverages-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#monthlyAverages-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
    Plotly.Plots.resize($('#scatterPlot-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#scatterPlot-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
    Plotly.Plots.resize($('#scatterPlotLogScale-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#scatterPlotLogScale-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
    Plotly.Plots.resize($('#volumeAnalysis-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#volumeAnalysis-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
  });
  $('#forecast_tab_link').click(function () {
    Plotly.Plots.resize($('#forecast-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#forecast-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
    Plotly.Plots.resize($('#forecast-bc-chart .js-plotly-plot')[0]);
    Plotly.relayout($('#forecast-bc-chart .js-plotly-plot')[0], {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
  });
}

$(function () {
  $('#app-content-wrapper').removeClass('show-nav');
  $('.toggle-nav').removeClass('toggle-nav');

  //make sure active Plotly plots resize on window resize
  window.onresize = function () {
    $('#graph .modal-body .tab-pane.active .js-plotly-plot').each(function () {
      Plotly.Plots.resize($(this)[0]);
    });
  };
  init_map();
  map_events();
  resize_graphs();

  $('#datesSelect').change(function () {
    //when date is changed

    //var sel_val = ($('#datesSelect option:selected').val()).split(',');
    sel_val = $('#datesSelect').val();

    //var startdate = sel_val[0];
    var startdate = sel_val;
    startdate = startdate.replace('-', '');
    startdate = startdate.replace('-', '');

    $loading.removeClass('d-none');
    get_time_series(
      watershed,
      subbasin,
      streamcomid,
      stationcode,
      stationname,
      startdate
    );
    get_time_series_bc(
      watershed,
      subbasin,
      streamcomid,
      stationcode,
      stationname,
      startdate
    );
  });
});

function getRegionGeoJsons() {
  let geojsons = region_index[$('#regions').val()]['geojsons'];
  for (let i in geojsons) {
    var regionsSource = new ol.source.Vector({
      url: staticGeoJSON + geojsons[i],
      format: new ol.format.GeoJSON(),
    });

    var regionStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'red',
        width: 3,
      }),
    });

    var regionsLayer = new ol.layer.Vector({
      name: 'myRegion',
      source: regionsSource,
      style: regionStyle,
    });

    map.getLayers().forEach(function (regionsLayer) {
      if (regionsLayer.get('name') == 'myRegion') map.removeLayer(regionsLayer);
    });
    map.addLayer(regionsLayer);

    setTimeout(function () {
      var myExtent = regionsLayer.getSource().getExtent();
      map.getView().fit(myExtent, map.getSize());
    }, 500);
  }
}

$('#stp-stream-toggle').on('change', function () {
  wmsLayer.setVisible($('#stp-stream-toggle').prop('checked'));
});
$('#stp-stations-toggle').on('change', function () {
  wmsLayer2.setVisible($('#stp-stations-toggle').prop('checked'));
});

// Regions gizmo listener
$('#regions').change(function () {
  getRegionGeoJsons();
});

function getBasinGeoJsons() {
  let basins = region_index2[$('#basins').val()]['geojsons'];
  for (let i in basins) {
    var regionsSource = new ol.source.Vector({
      url: staticGeoJSON2 + basins[i],
      format: new ol.format.GeoJSON(),
    });

    var regionStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#0050a0',
        width: 3,
      }),
    });

    var regionsLayer = new ol.layer.Vector({
      name: 'myRegion',
      source: regionsSource,
      style: regionStyle,
    });

    map.getLayers().forEach(function (regionsLayer) {
      if (regionsLayer.get('name') == 'myRegion') map.removeLayer(regionsLayer);
    });
    map.addLayer(regionsLayer);

    setTimeout(function () {
      var myExtent = regionsLayer.getSource().getExtent();
      map.getView().fit(myExtent, map.getSize());
    }, 500);
  }
}

function getSubBasinGeoJsons() {
  let subbasins = region_index3[$('#subbasins').val()]['geojsons'];
  for (let i in subbasins) {
    var regionsSource = new ol.source.Vector({
      url: staticGeoJSON3 + subbasins[i],
      format: new ol.format.GeoJSON(),
    });

    var regionStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#009C3B',
        width: 3,
      }),
    });

    var regionsLayer = new ol.layer.Vector({
      name: 'myRegion',
      source: regionsSource,
      style: regionStyle,
    });

    map.getLayers().forEach(function (regionsLayer) {
      if (regionsLayer.get('name') == 'myRegion') map.removeLayer(regionsLayer);
    });
    map.addLayer(regionsLayer);

    setTimeout(function () {
      var myExtent = regionsLayer.getSource().getExtent();
      map.getView().fit(myExtent, map.getSize());
    }, 500);
  }
}

// Regions gizmo listener
$('#basins').change(function () {
  getBasinGeoJsons();
});
$('#subbasins').change(function () {
  getSubBasinGeoJsons();
});

// ######################################################################
// Add data of the list to search input window
function list_search_func(value_selected) {
  document.getElementById('search-txt').value = value_selected;
}

// Update data of the list
function remove_names_for_list() {
  let filter = document.getElementById('search-txt').value.toUpperCase();
  let options = document
    .getElementById('list-search')
    .getElementsByTagName('option');

  for (enu = 0; enu < options.length; enu++) {
    let txtValue = options[enu].value;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      options[enu].style.display = '';
    } else {
      options[enu].style.display = 'none';
    }
  }
}

// Search gizmo
function search_func() {
  let zoom_desc = new $('#search-txt').val();
  $('#list-search-container').addClass('d-none');

  $.ajax({
    url: 'get-zoom-array',
    type: 'GET',
    data: {
      zoom_desc: zoom_desc,
    },

    success: function (resp) {
      let geojsons_boundary = resp['geojson'];
      let message = resp['message'];
      let geojson_staions = resp['stations'];
      let geojson_boundary_cont = resp['boundary-cont'];
      let geojson_stations_cont = resp['stations-cont'];

      if (message < 400) {
        var regionsSource = new ol.source.Vector({});
        regionsSource.addFeatures(
          new ol.format.GeoJSON().readFeatures(geojson_boundary_cont, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection(),
          })
        );

        var stationsSource = new ol.source.Vector({});
        stationsSource.addFeatures(
          new ol.format.GeoJSON().readFeatures(geojson_stations_cont, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection(),
          })
        );

        // Style region to zoom in
        var regionStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0)',
            width: 0,
          }),
        });
        // Style stations in region
        var stationsStyle = new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({ color: 'rgba(0, 0, 0, 0)' }),
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 1)',
              width: 2,
            }),
          }),
        });

        // Build region to zoom in
        var regionsLayer = new ol.layer.Vector({
          name: 'geojsons_boundary',
          source: regionsSource,
          style: regionStyle,
        });
        // Build stations to region
        var stationsLayer = new ol.layer.Vector({
          name: 'geojsons_stations',
          source: stationsSource,
          style: stationsStyle,
        });

        // Remove old layers
        map.getLayers().forEach(function (regionsLayer) {
          if (regionsLayer.get('name') == 'myRegion')
            map.removeLayer(regionsLayer);
        });

        // Remove previous zoom layers
        map.getLayers().forEach(function (regionsLayer) {
          if (regionsLayer.get('name') == 'geojsons_boundary')
            map.removeLayer(regionsLayer);
        });

        // Remove previous zoom layers
        map.getLayers().forEach(function (stationsLayer) {
          if (stationsLayer.get('name') == 'geojsons_stations')
            map.removeLayer(stationsLayer);
        });

        map.addLayer(regionsLayer);
        map.addLayer(stationsLayer);

        // Make zoom in to layer
        setTimeout(function () {
          var myExtent = regionsLayer.getSource().getExtent();
          map.getView().fit(myExtent, map.getSize());
        }, 500);

        setTimeout(function () {
          map.getLayers().forEach(function (stationsLayer, regionsLayer) {
            if (stationsLayer.get('name') == 'geojsons_stations')
              map.removeLayer(stationsLayer);
            if (stationsLayer.get('name') == 'geojsons_boundary')
              map.removeLayer(regionsLayer);
          });
        }, 10000);
      } else if (message >= 400) {
        // Read region to zoom in
        var regionsSource = new ol.source.Vector({
          url: staticStations + geojsons_boundary,
          format: new ol.format.GeoJSON(),
        });

        // Style region to zoom in
        var regionStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0)',
            width: 0,
          }),
        });

        // Build region to zoom in
        var regionsLayer = new ol.layer.Vector({
          name: 'geojsons_boundary',
          source: regionsSource,
          style: regionStyle,
        });

        // Remove previous zoom layers
        map.getLayers().forEach(function (regionsLayer) {
          if (regionsLayer.get('name') == 'geojsons_boundary')
            map.removeLayer(regionsLayer);
        });

        map.addLayer(regionsLayer);

        // Make zoom in to layer
        setTimeout(function () {
          var myExtent = regionsLayer.getSource().getExtent();
          map.getView().fit(myExtent, map.getSize());
        }, 500);

        $('#search-alert').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>Busqueda invalida.</strong></p>'
        );
        $('#search-alert').removeClass('d-none');

        setTimeout(function () {
          $('#search-alert').html('<p></p>');
          $('#search-alert').addClass('d-none');
        }, 1500);
      }
    },

    error: function () {
      $('#search-alert').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>Busqueda invalida.</strong></p>'
      );
      $('#search-alert').removeClass('d-none');

      setTimeout(function () {
        $('#search-alert').html('<p></p>');
        $('#search-alert').addClass('d-none');
      }, 1500);
    },
  });
}

function show_list_stations() {
  $('#list-search-container').removeClass('d-none');
}

$('#list-search-container').addClass('d-none');
document.getElementById('search-txt').onclick = function () {
  show_list_stations();
};
document.getElementById('search-btn').onclick = function () {
  search_func();
};
// ######################################################################

// Function for the select2 metric selection tool
$(document).ready(function () {
  $('#metric_select2').select2({ width: 'resolve' });
});

$('#metric_select2').on('select2:close', function (e) {
  // Display optional parameters
  //console.log("triggered!");
  let select_val = $('#metric_select2').val();
  //console.log(select_val);

  if (select_val.includes('MASE')) {
    $('#mase_param_div').fadeIn();
  } else {
    $('#mase_param_div').fadeOut();
  }

  if (select_val.includes('d (Mod.)')) {
    $('#dmod_param_div').fadeIn();
  } else {
    $('#dmod_param_div').fadeOut();
  }

  if (select_val.includes('NSE (Mod.)')) {
    $('#nse_mod_param_div').fadeIn();
  } else {
    $('#nse_mod_param_div').fadeOut();
  }

  if (select_val.includes("E1'")) {
    $('#lm_eff_param_div').fadeIn();
  } else {
    $('#lm_eff_param_div').fadeOut();
  }

  if (select_val.includes("D1'")) {
    $('#d1_p_param_div').fadeIn();
  } else {
    $('#d1_p_param_div').fadeOut();
  }

  if (select_val.includes('H6 (MHE)')) {
    $('#mean_h6_param_div').fadeIn();
  } else {
    $('#mean_h6_param_div').fadeOut();
  }

  if (select_val.includes('H6 (MAHE)')) {
    $('#mean_abs_H6_param_div').fadeIn();
  } else {
    $('#mean_abs_H6_param_div').fadeOut();
  }

  if (select_val.includes('H6 (RMSHE)')) {
    $('#rms_H6_param_div').fadeIn();
  } else {
    $('#rms_H6_param_div').fadeOut();
  }
});

// THIS DELETE THE DUPLICATES IN THE ARRAY MERGE //
function arrayUnique(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
}

// Event handler for the make table button
$(document).ready(function () {
  $('#make-table').click(function () {
    //console.log('Make Table Event Triggered');
    var model = $('#model option:selected').text();
    var watershed = 'south_america'; //OJO buscar como hacerla generica
    //var subbasin = 'continental' //OJO buscar como hacerla generica
    var subbasin = 'geoglows'; //OJO buscar como hacerla generica
    var startdate = '';
    /*
        let xName = $("#Station-Name-Tab")
        let xCode = $("#Station-Code-Tab")
        let xComid = $("#COMID-Tab")
        let htmlName = xName.html()
        let htmlCode = xCode.html()
        let htmlComid = xComid.html()
        var arName = htmlName.split(': ')
        var arCode = htmlCode.split(': ')
        var arComid = htmlComid.split(': ')
        let stationname = arName[1];
        let stationcode = arCode[1];
        let streamcomid = arComid[1];
        */

    let metrics_default = [
      'ME',
      'RMSE',
      'NRMSE (Mean)',
      'MAPE',
      'NSE',
      'KGE (2009)',
      'KGE (2012)',
      'R (Pearson)',
      'R (Spearman)',
      'r2',
    ]; // Default Metrics
    let selected_metrics = $('#metric_select2').val(); // Selected Metrics
    let selected_metric_joined = arrayUnique(
      metrics_default.concat(selected_metrics)
    );
    let additionalParametersNameList = [
      'mase_m',
      'dmod_j',
      'nse_mod_j',
      'h6_k_MHE',
      'h6_k_AHE',
      'h6_k_RMSHE',
      'lm_x_bar',
      'd1_p_x_bar',
    ];
    let additionalParametersValuesList = [];

    let getData = {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
      metrics: selected_metric_joined,
    };

    for (let i = 0; i < additionalParametersNameList.length; i++) {
      metricAbbr = additionalParametersNameList[i];
      getData[metricAbbr] = $(`#${metricAbbr}`).val();
    }

    // Creating the table
    $.ajax({
      url: 'make-table-ajax', // the endpoint
      type: 'GET', // http method
      data: getData,
      //			contentType : "json",

      // handle a successful response
      success: function (resp) {
        $('#metric-table').show();
        $('#table').html(resp); // Render the Table
        //console.log(resp)
        //console.log("success"); // another sanity check
      },

      // handle a non-successful response
      error: function (xhr, errmsg, err) {
        $('#table').html(
          "<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " +
            errmsg +
            '.</div>'
        ); // add the error to the dom
        console.log(xhr.status + ': ' + xhr.responseText); // provide a bit more info about the error to the console
      },
    });
  });
});

function makeDefaultTable(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname
) {
  let selected_metrics = [
    'ME',
    'RMSE',
    'NRMSE (Mean)',
    'MAPE',
    'NSE',
    'KGE (2009)',
    'KGE (2012)',
    'R (Pearson)',
    'R (Spearman)',
    'r2',
  ]; // Selected Metrics
  let additionalParametersNameList = [
    'mase_m',
    'dmod_j',
    'nse_mod_j',
    'h6_k_MHE',
    'h6_k_AHE',
    'h6_k_RMSHE',
    'lm_x_bar',
    'd1_p_x_bar',
  ];
  let additionalParametersValuesList = [];

  let getData = {
    watershed: watershed,
    subbasin: subbasin,
    streamcomid: streamcomid,
    stationcode: stationcode,
    stationname: stationname,
    metrics: selected_metrics,
  };

  for (let i = 0; i < additionalParametersNameList.length; i++) {
    metricAbbr = additionalParametersNameList[i];
    getData[metricAbbr] = $(`#${metricAbbr}`).val();
  }
  //console.log(getData);
  $.ajax({
    url: 'make-table-ajax', // the endpoint
    type: 'GET', // http method
    data: getData,
    //			contentType : "json",

    // handle a successful response
    success: function (resp) {
      //console.log(resp);
      $('#metric-table').show();
      $('#table').html(resp); // Render the Table
      //console.log(resp)
      //console.log("success"); // another sanity check
    },

    // handle a non-successful response
    error: function (xhr, errmsg, err) {
      $('#table').html(
        "<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " +
          errmsg +
          '.</div>'
      ); // add the error to the dom
      console.log(xhr.status + ': ' + xhr.responseText); // provide a bit more info about the error to the console
    },
  });
}

function get_available_dates(watershed, subbasin, comid) {
  $.ajax({
    type: 'GET',
    url: 'get-available-dates/',
    dataType: 'json',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      comid: comid,
    },
    error: function () {
      $('#forecast-loading').addClass('d-none');
      console.log(e);
      $('#dates').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An error occurred while retrieving the available dates</strong></p>'
      );

      setTimeout(function () {
        // $('#dates').addClass('d-none')
      }, 5000);
    },
    success: function (dates) {
      datesParsed = JSON.parse(dates.available_dates);
      $('#datesSelect').empty();
      $.each(datesParsed, function (i, p) {
        var val_str = p.slice(1).join();
        $('#datesSelect').append(
          $('<option></option>').val(val_str).html(p[0])
        );
      });
    },
  });
}

function get_time_series(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname,
  startdate
) {
  $('#forecast-loading').removeClass('d-none');
  $('#forecast-chart').addClass('d-none');
  $('#dates').addClass('d-none');
  $.ajax({
    type: 'GET',
    url: 'get-time-series/',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
      startdate: startdate,
    },
    error: function () {
      $('#forecast-loading').addClass('d-none');
      console.log(e);
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the forecast</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_time_series in');
        $('#forecast-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //$loading.addClass('d-none');
        $('#forecast-chart').removeClass('d-none');
        $('#forecast-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#forecast-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#forecast-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });

        var params = {
          watershed: watershed,
          subbasin: subbasin,
          streamcomid: streamcomid,
          stationcode: stationcode,
          stationname: stationname,
          startdate: startdate,
        };

        $('#submit-download-forecast').attr({
          target: '_blank',
          href: 'get-forecast-data-csv?' + jQuery.param(params),
        });

        $('#download_forecast').removeClass('d-none');

        $('#submit-download-forecast-ensemble').attr({
          target: '_blank',
          href: 'get-forecast-ensemble-data-csv?' + jQuery.param(params),
        });

        $('#download_forecast_ensemble').removeClass('d-none');

        get_time_series_bc(
          watershed,
          subbasin,
          streamcomid,
          stationcode,
          stationname,
          startdate
        );
      } else if (data.error) {
        $('#forecast-loading').addClass('d-none');
        console.log(data.error);
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the forecast</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_time_series out');
    },
  });
}

function get_time_series_bc(
  watershed,
  subbasin,
  streamcomid,
  stationcode,
  stationname,
  startdate
) {
  $('#forecast-bc-loading').removeClass('d-none');
  $('#forecast-bc-chart').addClass('d-none');
  $('#dates').addClass('d-none');
  $.ajax({
    type: 'GET',
    url: 'get-time-series-bc/',
    data: {
      watershed: watershed,
      subbasin: subbasin,
      streamcomid: streamcomid,
      stationcode: stationcode,
      stationname: stationname,
      startdate: startdate,
    },
    error: function () {
      $('#forecast-bc-loading').addClass('d-none');
      console.log(e);
      $('#info').html(
        '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the corrected forecast</strong></p>'
      );
      $('#info').removeClass('d-none');

      setTimeout(function () {
        $('#info').addClass('d-none');
      }, 5000);
    },
    success: function (data) {
      if (!data.error) {
        console.log('get_time_series_bc in');
        $('#forecast-bc-loading').addClass('d-none');
        $('#dates').removeClass('d-none');
        //$loading.addClass('d-none');
        $('#forecast-bc-chart').removeClass('d-none');
        $('#forecast-bc-chart').html(data);

        //resize main graph
        Plotly.Plots.resize($('#forecast-bc-chart .js-plotly-plot')[0]);
        Plotly.relayout($('#forecast-bc-chart .js-plotly-plot')[0], {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
        });

        var params = {
          watershed: watershed,
          subbasin: subbasin,
          streamcomid: streamcomid,
          stationcode: stationcode,
          stationname: stationname,
          startdate: startdate,
        };

        $('#submit-download-forecast-bc').attr({
          target: '_blank',
          href: 'get-forecast-bc-data-csv?' + jQuery.param(params),
        });

        $('#download_forecast_bc').removeClass('d-none');

        $('#submit-download-forecast-bc-ensemble').attr({
          target: '_blank',
          href: 'get-forecast-ensemble-bc-data-csv?' + jQuery.param(params),
        });

        $('#download_forecast_ensemble_bc').removeClass('d-none');
      } else if (data.error) {
        $('#forecast-bc-loading').addClass('d-none');
        console.log(data.error);
        $('#info').html(
          '<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the corrected forecast</strong></p>'
        );
        $('#info').removeClass('d-none');

        setTimeout(function () {
          $('#info').addClass('d-none');
        }, 5000);
      } else {
        $('#info')
          .html('<p><strong>An unexplainable error occurred.</strong></p>')
          .removeClass('d-none');
      }
      console.log('get_time_series_bc out');
    },
  });
}
