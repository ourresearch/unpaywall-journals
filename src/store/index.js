import Vue from 'vue'
import Vuex from 'vuex'

import {publisher} from "./publisher.store.js"
import {scenario} from "./scenario.store"
import {scenarioEditDialogs} from "../components/ScenarioEditDialogs/scenarioEditDialogsStore";
import {institution} from "./institution.store";
import {user} from "./user.store";
import configs from "../appConfigs"
import {roleFromPermissions} from "../shared/userPermissions";


Vue.use(Vuex)

// https://www.npmjs.com/package/short-uuid
const short = require('short-uuid');




// looks useful: https://scotch.io/tutorials/handling-authentication-in-vue-using-vuex

export default new Vuex.Store({
    state: {
        notSupportedMsgOpen: false,
        snackbarMsg: "",
        snackbarIsOpen: false,
        snackbarColor: "success",

        editMode: false,

        configsOpen: false,

        startupTutorialOpen: false,

        loading: 0,

        showColInfo: false,
        colInfo: null,

        infoKey: null,
        isLandingPage: false,


    },
    modules: {
        scenarioEditDialogs,
        institution,
        user,
        publisher,
        scenario,
    },


    mutations: {
        startLoading(state){
            // state.loading = true
        },
        setIsLandingPage(state, val){
            state.isLandingPage = !!val
        },
        finishLoading(state){
            // state.loading = false
        },

        showColInfo(state, name){
            state.colInfo = configs.journalCols.find(c => {
                return c.value === name
            })
            state.showColInfo = true
        },
        clearColInfo(state){
            state.colInfo = false
            state.colInfo = null
        },








        // UI stuff
        closeNotSupportedMsg(state) {
            state.notSupportedMsgOpen = false
        },
        openNotSupportedMsg(state) {
            state.notSupportedMsgOpen = true
        },
        snackbar(state, msg, color="success"){
            state.snackbarMsg = msg
            state.snackbarIsOpen = true
        },
        closeSnackbar(state){
            state.snackbarMsg = ""
            state.snackbarIsOpen = false
        },
        clearStartupTutorial(state){
            state.startupTutorialOpen = false
            localStorage.setItem("startupTutorialFinished", "true")
        },
        openStartupTutorial(state){
            if (!localStorage.getItem("startupTutorialFinished")){
                state.startupTutorialOpen = true
            }
        },


        // config stuff
        setConfigsOpen(state){
            if(state.editMode){
                console.log("edit mode bro")
                state.snackbarIsOpen = true
                state.snackbarMsg = "You can't change configs when you're Edit Mode"
                state.snackbarColor = "info"
                return
            }
            state.configsOpen = true
        },
        clearConfigsOpen(state){
            state.configsOpen = false
        },
        toggleConfigsOpen(state){
            console.log("toggle configs open")

            if (state.configsOpen){
                state.configsOpen = false
            }
            else { // configs are closed
                if(state.editMode){
                    state.editMode = false

                    // console.log("edit mode bro")
                    // state.snackbarIsOpen = true
                    // state.snackbarMsg = "You can't change configs when you're Edit Mode"
                    // state.snackbarColor = "info"
                    // return
                }
                state.configsOpen = true

            }

        },



        // edit mode
        setEditMode(state){
            state.editMode = true
            state.configsOpen = false
        },
        clearEditMode(state){
            state.editMode = false
        },
    },
    actions: {
    },

    getters: {
        loading(state){return state.loading > 0},
        colInfo(state){return state.colInfo},
        infoKey(state){return state.infoKey},
        isLandingPage(state){return state.isLandingPage},
        userCanEditActivePublisher: (state) => {

            const activeInstitution = state.institution
            const activePublisher = state.publisher

            const myUserInstitutionData = activeInstitution.institutionUsers.find(iu => {
                return iu.is_authenticated_user
            })
            console.log("myUserInstitutionData", myUserInstitutionData)
            if (!myUserInstitutionData) return

            const userRole = roleFromPermissions(myUserInstitutionData.permissions)
            console.log("const userRole", userRole)
            console.log("activePublisher", activePublisher)


            // ConsortiumAdmins can edit everything
            if (userRole === "ConsortiumAdmin") return true

            // regular admin can edit anyone EXCEPT ones the consortium owns
            else if (userRole === "Admin" && !activePublisher.isOwnedByConsortium) return true

            // same for Collaborators
            else if (userRole === "Collaborator" && !activePublisher.isOwnedByConsortium) return true

            return false


        },






    }
})




































