import {createSlice} from "@reduxjs/toolkit"

const cartSlice = createSlice({
    name:"Cart",
    initialState:null,
    reducers:{
        add(state,action){
            state.Cart=action.payload;
        },
        remove(state){
            state.Cart = null;
        }
    }
})
export const {add, remove } = cartSlice.actions;
export default cartSlice.reducer;