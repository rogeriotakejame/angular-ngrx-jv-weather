import { Action, createReducer, on } from "@ngrx/store"
import * as FromHomeActions from "./home.actions"
export interface HomeState {
    //text: string;  
    entity: any;
    loading: boolean;
    error: boolean;
}
export const homeInitialState:HomeState = {
    //text: 'Porto Alegre',
    entity: undefined,
    loading: false,
    error: false,
}

/*
const reducer = createReducer(
    homeInitialState,
    on(FromHomeActions.changeText, (state, { text }) => ({
        ...state,
        text,
    })),
);
*/

const reducer = createReducer(
    homeInitialState,
    on(FromHomeActions.clearHomeState, () => homeInitialState),
    on(
        FromHomeActions.loadCurrentWeather,
        FromHomeActions.loadCurrentWeatherById,
        state => ({
            ...state,
            loading: true,
            error: false,
        }),
    ),
    on(FromHomeActions.loadCurrentWeatherSuccess, (state, { entity }) => ({
        ...state,
        entity,
        loading:false
    })),
    on(FromHomeActions.loadCurrentWeatherFailed, state => ({
        ...state,
        loading:false,
        error:true
    })),
);

export function homeReducer(state: HomeState | undefined, action: Action): HomeState {
    return reducer(state, action);
}
