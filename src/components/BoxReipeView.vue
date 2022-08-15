<template>
    <div>
        <!-- <span>{{ boxId }} {{ step }} {{ selectedRBox }}</span> -->
        <div class="wrap_allnum fl">
            <span class="dp-inline-block fl">{{$t("content.all")}} </span>
            <span class="num" v-if="boxId=='all'" v-for="(box, $index) in allBoxInfo" :key="$index">{{ box.recipeCnt }}</span>
            <span class="num" v-else>{{ recipeBoxes?recipeBoxes.length:0 }}</span>
        </div>
        <div class="btn btn-default edit fr">
            <span class="padding-right-5" @click="$store.dispatch('box/setStep', 2)">{{$t("button.edit")}}</span>
        </div>
        <div class="wrap_recipes">
            <span hidden>{{ recipeBoxes }}</span>
            <div v-if="boxId=='all'">
            <div v-for="(box, $index) in recipeBoxes" :key="$index">
                <div class="alltitle" v-if="box.isDefault===false && box.recipe && box.recipe.length > 0">{{ box.name }}</div>
                <div v-else-if="box.recipe?false:true"></div><!-- //// 빈 폴더(박스) 비활성화 //// -->
                <div v-else-if="box.recipe.length == 0"></div>
                <div v-else><br/></div>
                <span hidden>{{ box.recipe }}</span>
                <div class="wrap_in" v-for="recipe in box.recipe" :key="recipe.id">
                <router-link :to="'/recipedetail/'+recipe.recipeId">
                    <div class="photo fl"><img :src="getImgURL(recipe.mainImgId)"/></div>
                    <div class="wrap_text fl">
                        <div class="wrap_bullet">
                            <span v-for="(period, idx) in $t('option.period')" :key="idx">
                            <div class="squre4 fl" v-if="recipe.period == idx">{{ period[0] }}</div>
                            </span>
                            <div class="new2 fl" v-if="recipe.new"></div>
                        </div>
                        <div class="fr"></div>
                        <div class="title">
                            <div class="fl padding-right-10">{{ recipe.title }}</div>
                            <span class="icon_reply fl"></span>
                        </div>
                        <div class="text">{{ recipe.subTitle }}</div>
                    </div>
                </router-link>
                </div>
            </div>
            </div>
            <div v-else>
                <div class="alltitle">{{ selectedRecipeBox.name }}</div>
                <div class="wrap_in" v-for="recipe in recipeBoxes" :key="recipe.id">
                <router-link :to="'/recipedetail/'+recipe.recipeId">
                    <div class="photo fl"><img :src="getImgURL(recipe.mainImgId)"/></div>
                    <div class="wrap_text fl">
                        <div class="wrap_bullet">
                            <span v-for="(period, idx) in $t('option.period')" :key="idx">
                            <div class="squre4 fl" v-if="recipe.period == idx">{{ period[0] }}</div>
                            </span>
                            <div class="new2 fl" v-if="recipe.new"></div>
                        </div>
                        <div class="fr"></div>
                        <div class="title">
                            <div class="fl padding-right-10">{{ recipe.title }}</div>
                            <span class="icon_reply fl"></span>
                        </div>
                        <div class="text">{{ recipe.subTitle }}</div>
                    </div>
                </router-link>
                </div>
            </div>
            <!-- ////<div
                type="button"
                v-on:click="appendRecipes(true)"
                :disabled="this.dataRcpFull === true"
                :hidden="this.totRecipes == this.cntRecipes"
                :class="{disabled : dataRcpFull}"
            >
            더보기 ({{cntRecipes}}/{{totRecipes}})
            </div>//// -->
            <infinite-loading @infinite="getRecipeBoxAll">
                <div slot="no-more"><br/></div>
            </infinite-loading>
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import InfiniteLoading from 'vue-infinite-loading';
export default {
    name : "BoxRecipeView",
    data: ()=>({
        page : 0,
        recipeBoxes : [],
        allBoxInfo : [],
    }),

    computed : {
        ...mapState('box', ['boxId', 'step', 'allBox', 'selectedRBox']),
        // ...mapGetters('box', ['step','boxId', 'allBox', 'selectedRBox']),
    },

    components: {
        InfiniteLoading,
    },

    methods:{
        getImgURL(id) {
            const url = `${this.$API_SERVER}/file/download/thumbnail?fileId=` + id;
            console.log(url);
            return url
        },
        
        // async getRecipeBoxList() {            
        //     const response = await this.$api(
        //     `${this.$API_SERVER}/api/recipebox/mine`,
        //     "get"
        //     );
        //     if (response.status === this.HTTP_OK) {
        //         this.recipeBoxes = response.data;                
        //         this.bindBoxes()
        //     }
        // },
        // boxId 에 따른 데이터 얻기
        async getRecipeBoxAll($state) {
            let params = '';
                params += `?page=${this.page}`;
                params += '&sort=createdAt,DESC';
            let url = `${this.$API_SERVER}/api/reciperecipebox/recipe`
            let data = [];
            if(this.boxId === 'all'){
                url += `/mine`;
            }
            else{
                data = {box: this.boxId};
            }
            params += `&size=${this.recipeBoxes.recipe?this.recipeBoxes.recipe.length:0}`;
            const response = await this.$api(url+params, "get", data);
            if (response.status === this.HTTP_OK) {                
                if(response.data.length){
                    this.allBoxInfo = []
                    this.recipeBoxes = response.data;
                    console.log("getRecipeBoxAll:",this.recipeBoxes)

                    let recipeCnt = 0
                    let thumbnails = []
                    let newFlag = false
                    this.recipeBoxes.forEach(box => {
                    if(box.recipe){
                        box.recipe.forEach(recipe => {
                        recipeCnt = recipeCnt + 1
                        if(recipe.mainImgId) thumbnails.push({"mainImgId": recipe.mainImgId})
                        if(recipe.new) newFlag = true
                        });
                    }
                    });
                    this.allBoxInfo.push({
                    'name': '모든 레시피',
                    'recipeCnt': recipeCnt,
                    'thumbnails': thumbnails,
                    'new': newFlag,
                    'recipeBoxes': this.recipeBoxes
                    });
                    console.log(this.allBoxInfo)
                }   
                this.page++;
                $state.loaded();
                if(response.data.length / 2 < 1){
                    $state.complete();
                }else{
                    $state.complete();
                }
            }else{
                console.log(response.status);
                $state.complete();
            }
        },
        async getRecipeBoxById(id) {
            const response = await this.$api(
            `${this.$API_SERVER}/api/recipebox/${id}`,
            "get"
            );
            if (response.status === this.HTTP_OK) {
                this.selectedRecipeBox = response.data;
            }
        },
    }
}
</script>