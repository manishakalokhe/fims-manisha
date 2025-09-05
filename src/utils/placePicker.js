/**
 * @license
 * Copyright 2024 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Initialize Place Picker functionality
async function initPlacePicker() {
  // Wait for the Google Maps Extended Component Library to load
  await customElements.whenDefined('gmpx-place-picker');
  
  const placePicker = document.querySelector('gmpx-place-picker');
  const mapContainer = document.getElementById('map');
  const combinedAddressInput = document.getElementById('combined-address');
  const landmarksSelect = document.getElementById('landmarks');
  
  // Form input elements
  const addressInput = document.getElementById('address-autocomplete');
  const aptSuiteInput = document.getElementById('apt-suite');
  const cityInput = document.getElementById('city');
  const stateProvinceInput = document.getElementById('state-province');
  const zipPostalCodeInput = document.getElementById('zip-postal-code');
  const countryInput = document.getElementById('country');

  let map;
  let marker;
  let infoWindow;
  const descriptorMarkers = [];

  // Initialize map if container exists
  if (mapContainer) {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    const mapOptions = {
      center: { lat: 28.43268, lng: 77.0459 }, // Initial center coordinates (Gurgaon)
      zoom: 16,
      mapId: "f8b9e6163e48e501"
    };

    map = new Map(mapContainer, mapOptions);
    
    marker = new AdvancedMarkerElement({
      map,
      position: mapOptions.center,
      gmpDraggable: true
    });

    // Add marker dragend listener
    marker.addListener('dragend', () => {
      const newPosition = marker.position;
      handleLocationUpdate(newPosition);
    });
  }

  // Place picker event listener
  if (placePicker) {
    placePicker.addEventListener('gmpx-placechange', (event) => {
      const place = event.detail.place;
      
      if (!place.geometry) {
        console.error("No details available for selected place");
        return;
      }

      // Update map if it exists
      if (map && marker) {
        marker.position = place.geometry.location;
        map.setCenter(place.geometry.location);
        
        // Update info window
        if (infoWindow) {
          infoWindow.close();
        }
        infoWindow = new google.maps.InfoWindow({
          content: place.name || place.formatted_address,
          headerDisabled: true
        });
        infoWindow.open(map, marker);
      }

      // Fill form fields
      fillInAddress(place);
      
      // Get address descriptor landmarks
      if (place.place_id) {
        addressDescriptorPlaceIdLookup(place.place_id);
      }
    });
  }

  function fillInAddress(place) {
    if (!place.address_components) return;

    // Clear previous values
    if (aptSuiteInput) aptSuiteInput.value = '';
    if (cityInput) cityInput.value = '';
    if (stateProvinceInput) stateProvinceInput.value = '';
    if (zipPostalCodeInput) zipPostalCodeInput.value = '';
    if (countryInput) countryInput.value = '';

    let streetNumber = '';
    let route = '';

    // Get each component of the address from the place details
    for (const component of place.address_components) {
      const componentType = component.types[0];

      switch (componentType) {
        case 'street_number':
          streetNumber = component.long_name;
          break;
        case 'route':
          route = component.short_name;
          break;
        case 'premise':
        case 'subpremise':
          if (aptSuiteInput) aptSuiteInput.value = component.short_name;
          break;
        case 'locality':
          if (cityInput) cityInput.value = component.long_name;
          break;
        case 'administrative_area_level_1':
          if (stateProvinceInput) stateProvinceInput.value = component.short_name;
          break;
        case 'postal_code':
          if (zipPostalCodeInput) zipPostalCodeInput.value = component.long_name;
          break;
        case 'country':
          if (countryInput) countryInput.value = component.long_name;
          break;
      }
    }

    // Combine street number and route
    if (addressInput) {
      addressInput.value = `${streetNumber} ${route}`.trim();
    }

    // Update Materialize text fields if available
    if (typeof M !== 'undefined') {
      M.updateTextFields();
    }
  }

  async function addressDescriptorPlaceIdLookup(placeId) {
    if (!landmarksSelect) return;

    try {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({
        'placeId': placeId,
        'extraComputations': ['ADDRESS_DESCRIPTORS'],
        'fulfillOnZeroResults': true
      }, function(results, status) {
        if (status === 'OK' && results[0]) {
          const addressDescriptor = results[0].address_descriptor;
          
          if (addressDescriptor && addressDescriptor.landmarks) {
            populateLandmarks(addressDescriptor.landmarks, results[0].formatted_address);
          } else {
            clearLandmarks();
            if (combinedAddressInput) {
              combinedAddressInput.value = results[0].formatted_address || '';
            }
          }
        } else {
          clearLandmarks();
          console.warn('Geocode was not successful:', status);
        }
      });
    } catch (error) {
      console.error('Error in address descriptor lookup:', error);
      clearLandmarks();
    }
  }

  function populateLandmarks(landmarks, formattedAddress) {
    if (!landmarksSelect) return;

    // Clear existing options and markers
    clearLandmarks();
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.text = 'Choose your Landmark';
    landmarksSelect.appendChild(defaultOption);

    landmarks.forEach((landmark, index) => {
      const option = document.createElement('option');
      option.value = landmark.display_name;
      option.text = `${landmark.spatial_relationship} ${landmark.display_name}`;
      landmarksSelect.appendChild(option);

      // Add landmark marker to map if map exists
      if (map && landmark.place_id) {
        addLandmarkMarker(landmark, index + 1);
      }
    });

    // Auto-select first landmark if available
    if (landmarksSelect.options.length > 1) {
      landmarksSelect.selectedIndex = 1;
      updateCombinedAddress(formattedAddress);
      
      // Re-initialize Materialize select if available
      if (typeof M !== 'undefined') {
        M.FormSelect.init(landmarksSelect);
      }
    }
  }

  async function addLandmarkMarker(landmark, index) {
    if (!map) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      
      geocoder.geocode({ placeId: landmark.place_id }, (results, status) => {
        if (status === "OK" && results[0]) {
          const markerContent = document.createElement('div');
          markerContent.className = index === 1 ? 'descriptor-marker highlighted' : 'descriptor-marker';
          markerContent.textContent = index;

          const landmarkMarker = new AdvancedMarkerElement({
            map: map,
            position: results[0].geometry.location,
            content: markerContent
          });

          descriptorMarkers.push(landmarkMarker);

          // Add hover info window
          const landmarkInfoWindow = new google.maps.InfoWindow({
            content: landmark.display_name,
            headerDisabled: true
          });

          markerContent.addEventListener("mouseover", () => {
            landmarkInfoWindow.open(map, landmarkMarker);
          });

          markerContent.addEventListener("mouseout", () => {
            landmarkInfoWindow.close();
          });
        }
      });
    } catch (error) {
      console.error('Error adding landmark marker:', error);
    }
  }

  function clearLandmarks() {
    if (landmarksSelect) {
      // Destroy Materialize instance if available
      if (typeof M !== 'undefined') {
        const instance = M.FormSelect.getInstance(landmarksSelect);
        if (instance) instance.destroy();
      }

      // Clear options
      landmarksSelect.innerHTML = '';

      // Re-initialize if Materialize is available
      if (typeof M !== 'undefined') {
        M.FormSelect.init(landmarksSelect);
      }
    }

    // Clear descriptor markers
    descriptorMarkers.forEach(marker => {
      if (marker.setMap) marker.setMap(null);
    });
    descriptorMarkers.length = 0;
  }

  function updateCombinedAddress(formattedAddress) {
    if (!combinedAddressInput || !landmarksSelect) return;

    const selectedOption = landmarksSelect.options[landmarksSelect.selectedIndex];
    if (selectedOption && selectedOption.text) {
      combinedAddressInput.value = `${formattedAddress}\n${selectedOption.text}`;
    } else {
      combinedAddressInput.value = formattedAddress || '';
    }

    // Update Materialize text fields if available
    if (typeof M !== 'undefined') {
      M.updateTextFields();
    }
  }

  function handleLocationUpdate(position) {
    if (!map) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      location: position,
      'extraComputations': ["ADDRESS_DESCRIPTORS"],
      'fulfillOnZeroResults': true
    }, (results, status) => {
      if (status === "OK" && results[0]) {
        const place = results[0];
        fillInAddress(place);
        
        if (place.place_id) {
          addressDescriptorPlaceIdLookup(place.place_id);
        }
        
        map.setCenter(position);
      } else {
        console.warn("Geocoder failed:", status);
      }
    });
  }

  // Add landmarks dropdown change listener
  if (landmarksSelect) {
    landmarksSelect.addEventListener('change', () => {
      const formattedAddress = combinedAddressInput ? 
        combinedAddressInput.value.split('\n')[0] : '';
      updateCombinedAddress(formattedAddress);

      // Highlight selected landmark marker
      const selectedIndex = landmarksSelect.selectedIndex - 1;
      descriptorMarkers.forEach((marker, index) => {
        if (marker.content) {
          if (selectedIndex === index) {
            marker.content.classList.add("highlighted");
          } else {
            marker.content.classList.remove("highlighted");
          }
        }
      });
    });
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlacePicker);
} else {
  initPlacePicker();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initPlacePicker };
}