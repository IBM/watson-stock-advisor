import { createGlobalStyle } from 'styled-components';

import { colors } from './constants/style';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Poppins:400,600,700&display=swap');
  @import url('https://fonts.googleapis.com/css?family=Poppins:400,600,700&display=swap');


  html, body, #root {
    width: 100%;
    height: 100%;
    font-family: 'Asap', sans-serif !important;
  }

  h1 {
    text-transform: uppercase;
    font-size: 28px;
    font-weight: 600;
  }

  div.heading {
    margin-top: 10px;

    &::before {
      display: block;
      content: '';
      width: 50px;
      height: 3px;
      background-color: ${colors.textYellow};
      position: absolute;
      top: -10px;
      left: 0;
      margin: 10px 20px;
    }

    h2 {
      padding: 0 20px;
      text-transform: uppercase;
      font-size: 20px;
      font-weight: 600;
    }

    > div {
      font-size: 12px;
      padding: 0 20px;
      margin-top: -10px;
    }
  }

  

  .logo {
    font-family: 'Poppins';
    font-size: 20px;

    &.bold {
      font-weight: 700;
    }
  }

  a {
    color: ${colors.textGrey} !important;

    :hover, :focus {
      color: ${colors.textYellow} !important;
    }
  }

  .btn {
    &.btn-info {
      background: transparent;
      border: 2px solid ${colors.textYellow} !important;
      color: ${colors.textYellow} !important;

      &:hover, &:active {
        background: ${colors.textYellow};
        border: 2px solid ${colors.textYellow} !important;
        color: ${colors.white} !important;
      }
    }
  }

  .confirm_delete {
    .btn-primary {
      background-color: ${colors.red} !important;
      border: 2px solid ${colors.red};
    }
  }
`;

export default GlobalStyle;