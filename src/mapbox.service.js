(function() {
  'use strict';

  angular.module('angular-mapbox').service('mapboxService', mapboxService);

  function mapboxService() {
    var _mapInstances = [],
        _markers = [],
        _mapOptions = [];

    var fitMapToMarkers = debounce(function(map) {
//      console.log('map', map);
//      console.log('map instances', _mapInstances);
//      console.log('map index', _mapInstances.indexOf(map));
//      
//      var mapIndex = 0;
//      angular.forEach(_mapInstances, function(mapInstance, i) {
//        console.log('mapInstance === map', mapInstance === map);
//        if (mapInstance === map) {
//          mapIndex = i;
//        }
//      });
//      
//      console.log('mapIndex', mapIndex);
      // TODO: refactor
      var group = new L.featureGroup(getMarkers(map));
      map.fitBounds(group.getBounds());
    }, 0);

    var service = {
      init: init,
      getMapInstances: getMapInstances,
      addMapInstance: addMapInstance,
      getMarkers: getMarkers,
      addMarker: addMarker,
      removeMarker: removeMarker,
      fitMapToMarkers: fitMapToMarkers,
      getOptionsForMap: getOptionsForMap
    };
    return service;

    function init(opts) {
      opts = opts || {};
      L.mapbox.accessToken = opts.accessToken;
    }

    function addMapInstance(map, mapOptions) {
      mapOptions = mapOptions || {};

      _mapInstances.push(map);
      _mapOptions.push(mapOptions);
      _markers.push([]);
    }

    function getMapInstances() {
      return _mapInstances;
    }

    function getMapInstanceIndex(map) {
      return _mapInstances.indexOf(map);
    }

    function addMarker(marker, map) {
      var instanceIndex = getMapInstanceIndex(map);
      // TODO: tie markers to specific map instance
      _markers[instanceIndex].push(marker);

      var opts = getOptionsForMap(map);
      if(opts.scaleToFit) {
        fitMapToMarkers(map);
      }
    }

    function removeMarker(map, marker) {
      map.removeLayer(marker);

      var markerIndexToRemove;
      for(var i = 0, markers = getMarkers(map); markers[i]; i++) {
        if(markers[i]._leaflet_id === marker._leaflet_id) {
          markerIndexToRemove = i;
        }
      }
      markers.splice(markerIndexToRemove, 1);

      var opts = getOptionsForMap(map);
      if(opts.scaleToFit && opts.scaleToFitAll) {
        fitMapToMarkers(map);
      }
    }

    // TODO: move to utils
    function debounce(func, wait, immediate) {
      var timeout;

      return function() {
        var context = this,
            args = arguments;

        var later = function() {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
          func.apply(context, args);
        }
      };
    }

    function getMarkers(map) {
      var instanceIndex = getMapInstanceIndex(map);
      return _markers[instanceIndex];
    }

    function getOptionsForMap(map) { // jshint ignore:line
      var instanceIndex = getMapInstanceIndex(map);
      console.log('instanceIndex', instanceIndex)
      return _mapOptions[instanceIndex];
    }
  }
})();
