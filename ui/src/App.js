import React, { Component } from 'react';
import styled from 'styled-components';

import GlobalStyle from './globalStyle';
import { colors } from './constants/style';

import Header from './components/Header';
import Nav from './components/Nav';
import Footer from './components/Footer';
import SidePanel from './components/SidePanel';
import Dashboard from './components/Dashboard';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${colors.lightGrey};

  main {
    flex: 1;
    width: 100%;
    height: calc(100% - 50px);
    display: flex;
  }
`;

class App extends Component {
  render() {
    return (
      <Container>
        <GlobalStyle />
        <Header />
        <main>
          <Nav />
          <Dashboard />
          <SidePanel />
        </main>
        {/*<Footer />*/}
      </Container>
    );
  }
}

export default App;
