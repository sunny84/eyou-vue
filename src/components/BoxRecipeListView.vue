<template>
    <div>
            <div class="wrap_allnum fl">
                <span class="dp-inline-block fl">{{$t("content.all")}} </span>
                <span class="num">{{ recipeBoxes.length }}</span>
            </div>
            <div class="btn btn-default edit fr">
                <span class="padding-right-5" @click="callEdit">{{$t("button.edit")}}</span>
            </div>
            <div class="wrap_recipes">
                <div v-for="(box, index) in recipeBoxes" :key="index">
                <div class="alltitle" v-if="box.isDefault===false">{{ box.name }}</div>
                <div v-else><br/></div>
                <div class="wrap_in" v-for="recipe in box.recipe" :key="recipe.id">
                <router-link :to="'/recipedetail/'+recipe.recipeId">
                    <div class="photo fl"><img :src="recipe.file"/></div>
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
                <!-- <div
                    type="button"
                    v-on:click="appendRecipes(true)"
                    :disabled="this.dataRcpFull === true"
                    :hidden="this.totRecipes == this.cntRecipes"
                    :class="{disabled : dataRcpFull}"
                >
                더보기 ({{cntRecipes}}/{{totRecipes}})
                </div> -->
                <!-- <infinite-loading @infinite="getRecipeBoxList">
                    <div slot="no-more"><br/></div>
                </infinite-loading> -->
            </div>
    </div>
</template>
<script>
export default {
    name : "BoxRecipeListView",
    data: ()=>({
        page : 0,
        recipeBoxes : [],
        boxName: '기본박스',
    }),
    created() {
        this.initialize();
    },
    methods : {        
        initialize() {
            this.getRecipeBoxById(this.boxId);
        },
    }
}
</script>