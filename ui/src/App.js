import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import GlobalStyle from './globalStyle';
import { colors } from './constants/style';

import { initAction } from './actions/portfolio';

import Header from './components/Header';
import Nav from './components/Nav';
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
  componentDidMount() {
    this.props.onInit();
  }

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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  onInit: initAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
