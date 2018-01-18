/* @flow */

import * as React from 'react';
import { NativeModules } from 'react-native';

import type { ForecastType } from 'shared/models/Forecast';
import { APIXU_API_KEY } from '../../secrets';

const MyLocation = NativeModules.MyLocation;

type State = {
  isFetching: boolean,
  data: ?Array<ForecastType>,
};

const withWeather = (Component: React.ComponentType<*>) =>
  class extends React.Component<*, State> {
    state = {
      isFetching: true,
      data: null,
    };

    fetchWeatherData = async () => {
      const {
        longitude,
        latitude,
        cityName,
      } = await MyLocation.getCurrentLocation();

      global.myCurrentLocation = cityName; // TODO use something different, like AsyncStorage
      const url = `https://api.apixu.com/v1/forecast.json?key=${APIXU_API_KEY}&q=${latitude},${longitude}&days=7`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        /* TODO Note: Setting state here is not safe as the component could unmount before the request finishes.
        We could use Redux, RxJS, etc. However, just for the purpose of the workshop, we will stick with it */
        this.setState({ isFetching: false, data: data.forecast.forecastday });
      } catch (e) {
        this.setState({ isFetching: false });
      }
    };

    render() {
      const { isFetching, data } = this.state;
      return (
        <Component
          isFetching={isFetching}
          data={data}
          fetchWeatherData={this.fetchWeatherData}
          {...this.props}
        />
      );
    }
  };

export default withWeather;
