import {
  ADD_COMPANY_INTENT,
  ADD_COMPANY_SUCCESS,
  ADD_COMPANY_FAILED,
  PORTFOLIO_LIST_LOAD_SUCCESS,
  SELECT_SHARE,
  DELETE_COMPANY_INTENT,
  DELETE_COMPANY_SUCCESS,
  DELETE_COMPANY_FAILED,
} from '../constants/portfolio';

const getInitialState = () => ({
  portfolioList: [],
  selectedShareId: null,
});

const portfolio = (state = getInitialState(), {type, payload, meta}) => {
  switch (type) {
    case ADD_COMPANY_INTENT: {
      const newItem = {
        company: payload.name,
        isLoading: true,
      };
      return {
        ...state,
        portfolioList: [
          ...state.portfolioList,
          newItem,
        ]
      };
    }
    case ADD_COMPANY_SUCCESS:
      return {
        ...state,
        portfolioList: state.portfolioList.map(item => {
          if (item.company !== payload.item.name) {
            return item;
          }

          return {
            ...item,
            ...payload.data,
            isLoading: false,
          }
        }),
      };
    case ADD_COMPANY_FAILED:
      return {
        ...state,
        portfolioList: state.portfolioList.filter(item => item.company !== payload.item.name),
      };
    case PORTFOLIO_LIST_LOAD_SUCCESS:
      return {
        ...state,
        portfolioList: payload,
      };
    case SELECT_SHARE: 
      return {
        ...state,
        selectedShareId: payload,
      };
    case DELETE_COMPANY_INTENT:
      return {
        ...state,
        portfolioList: state.portfolioList.map(item => {
          if (item.ticker === payload) {
            return {
              ...item,
              isDeleting: true,
            };
          }
          return item;
        }),
      };
    case DELETE_COMPANY_SUCCESS:
      return {
        ...state,
        portfolioList: state.portfolioList.filter(item => item.ticker !== payload),
      };
    case DELETE_COMPANY_FAILED:
      return {
        ...state,
        portfolioList: state.portfolioList.map(item => {
          if (item.ticker === payload) {
            return {
              ...item,
              isDeleting: undefined,
            };
          }
          return item;
        }),
      };
    default:
      return state;
  }
};

export default portfolio;
