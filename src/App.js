import React, { Component} from 'react';
import { Provider } from 'react-redux';
import store from './store';
import { Page } from '@shopify/polaris';
import { EmbeddedApp } from '@shopify/polaris/embedded';

import ApiConsole from './components/ApiConsole'

class App extends Component {
  render() {
    const { apiKey, shopOrigin } = window;

    return (
      <Provider store={store}>
        <EmbeddedApp shopOrigin={shopOrigin} apiKey={apiKey}>
          <Page
            title="My application"
            breadcrumbs={[{ content: 'Home', url: '/foo' }]}
            primaryAction={{ content: 'Add something' }}
          >
            <ApiConsole />
          </Page>
        </EmbeddedApp>
      </Provider>
    );
  }
};

export default App;
