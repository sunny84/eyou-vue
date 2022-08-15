/**
 * box 정보 관리 
 */
 export default {

    namespaced : true,
  
    state : {
      listView: 0,
      step: 0,
      boxId: 0,
      boxName: '',
      allBox: [],
      boxList: [],
      selectedRBox: [],      
      // selectedRecipeBoxIds: [],
    },
  
    getters : {
      listView(state){
        return state.listView;
      },
      step(state){
        return state.step;
      },
      boxId(state){
        return state.boxId;
      },
      boxName(state){
        return state.boxName;
      },
      allBox(state){
        return state.allBox;
      },
      selectedRBox(state){
        return state.selectedRBox;
      },
      // selectedRecipeBoxIds(state){
      //   return state.selectedRecipeBoxIds;
      // },
    },
  
    mutations : {
      setListView(state, listView){
        state.listView = listView;
      },
      setStep(state, step){
        state.step = step;
      },
      setBoxId(state, boxId){
        state.boxId = boxId;
      },
      setBoxName(state, boxName){
        state.boxName = boxName;
      },
      setAllBox(state, allBox){
        state.allBox = allBox;
      },
      setSelectedRBox(state, selectedRBox){
        state.selectedRBox = selectedRBox;
      },
      // setselectedRecipeBoxIds(state, selectedRecipeBoxIds){
      //   state.selectedRecipeBoxIds = selectedRecipeBoxIds;
      // },
    },
  
    actions : {
      setListView({commit}, listView){
        commit('setListView', listView);
      },
      setStep({commit}, step){
        commit('setStep', step);
      },
      setBoxId({commit}, boxId){
        commit('setBoxId', boxId);
      },
      setBoxName({commit}, boxName){
        commit('setBoxName', boxName);
      },
      setAllBox({commit}, allBox){
        commit('setAllBox', allBox);
      },
      setSelectedRBox({commit}, selectedRBox){
        commit('setSelectedRBox', selectedRBox);
      },
      // setselectedRecipeBoxIds({commit}, selectedRecipeBoxIds){
      //   commit('setselectedRecipeBoxIds', selectedRecipeBoxIds);
      // },
    }
  }