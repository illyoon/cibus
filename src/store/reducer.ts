import { reducerWithInitialState } from "typescript-fsa-reducers";
import { initialState } from "./state";
import {
  addToCart,
  setFeedback,
  setupMenu,
  setValid,
  addToOrders,
  updateOrdersItemStatus,
  setCurrency,
  updateItemAddedToCart,
  removeItemFromCart,
} from "./actions";
import { LOCAL_STORAGE_CART, LOCAL_STORAGE_ORDERS, UNCATEGORIZED } from "../utils/_constants";
import { TcategorizedMenuItems } from "./types";
import i18n from "../i18n";
import { Language } from "../API";
import { correctLanguagei18nItem } from "../utils/useCorrectLanguage";
import { TMenuItemTranslated, TNonNullMenuItem } from "../types";

export const reducer = reducerWithInitialState(initialState)
  .case(setValid, (state, valid) => ({
    ...state,
    valid,
  }))
  .case(addToCart, (state, payload) => {
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify([...state.cart, payload]));
    return {
      ...state,
      cart: [...state.cart, payload],
    };
  })
  .case(updateItemAddedToCart, (state, payload) => {
    const newCart = state.cart.map((cartItem) =>
      cartItem.id === payload?.id ? payload : cartItem
    );
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(newCart));
    return {
      ...state,
      cart: newCart,
    };
  })
  .case(removeItemFromCart, (state, id) => {
    const newState = state.cart.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(newState));
    return {
      ...state,
      cart: newState,
    };
  })
  .case(setFeedback, (state, feedback) => ({
    ...state,
    feedback,
  }))
  .case(setCurrency, (state, currency) => ({
    ...state,
    currency,
  }))
  .case(setupMenu, (state, { payload, currentLang }) => {
    if (payload && payload.items) {
      let itemsByCategory: TcategorizedMenuItems = {};
      const favorites: TMenuItemTranslated[] = [];
      const translatedItems = payload.items.map((item) =>
        item ? correctLanguagei18nItem(item, currentLang) : null
      );
      const categories = [
        ...(translatedItems.map((item) => (item ? item.i18n.category : null)) as string[]),
        "",
      ];
      const categoriesWithoutRepetition = categories.reduce(
        (prev, curr) => {
          if (prev.indexOf(curr) === -1 && curr) {
            return [...prev, curr];
          }
          return prev;
        },
        [categories[0]]
      );
      categoriesWithoutRepetition.forEach((cat) => {
        itemsByCategory[cat] = {};
      });
      translatedItems.forEach((curr) => {
        if (curr) {
          if (curr.favorite) {
            console.log("favorite found", curr);
            favorites.push(curr);
          }

          itemsByCategory[curr?.i18n.category ? curr.i18n.category : UNCATEGORIZED][
            curr!.id
          ] = curr;
        }
      });
      return {
        ...state,
        menu: {
          categories: categoriesWithoutRepetition,
          itemsByCategory,
          favorites,
          originalMenuItemList: payload.items.filter((item) => item !== null) as TNonNullMenuItem[],
        },
      };
    }
    return state;
  })
  .case(addToOrders, (state, newlyCreatedOrder) => {
    localStorage.removeItem(LOCAL_STORAGE_CART);
    const newOrdersArray = [...state.orders, newlyCreatedOrder];
    localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(newOrdersArray));
    return {
      ...state,
      orders: newOrdersArray,
      cart: [],
    };
  })
  .case(updateOrdersItemStatus, (state, { id, status }) => {
    const newOrdersArray =
      status === "PAYED" || status === "DENIED"
        ? state.orders.filter((item) => item!.id !== id)
        : state.orders.map((item) => (item?.id === id ? { ...item, status } : item));
    localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(newOrdersArray));
    return {
      ...state,
      orders: newOrdersArray,
    };
  });
