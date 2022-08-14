<template>
  <div>
    <main class="recipebox">
      <!--HEADER-->
      <h1 class="fl"><router-link :to="'/recipedetail/'+recipeId"><img src="@/assets/images/icon_back.png" alt="돌아가기" title="돌아가기"/></router-link>
        <span class="color-orange padding-left-15">{{ $t("title.recipeBox") }}</span>
      </h1>
      <div class="wrap_menu">
          <ul>
              <li class="menu" :class="{on : this.$route.path == '/myrecipe'}" style="cursor: ponter;" onclick="location.href='/myrecipe';">{{ $t("menu.myRecipe") }}</li><!--<router-link :to="'/myrecipe'"></router-link>-->
              <li class="menu" :class="{on : this.$route.path == '/recipeboxlist'}" style="cursor: ponter;" onclick="location.href='/recipeboxlist';">{{ $t("menu.savedRecipe") }}</li><!--<router-link :to="'/recipeboxlist'"></router-link>-->
              <li class="menu" :class="{on : this.$route.path == '/todaySawRecipe'}" style="cursor: ponter;" onclick="location.href='/todaySawRecipe';">{{ $t("menu.historyRecipe") }}</li><!--<router-link :to="'#'"></router-link>-->
          </ul>
      </div>
      <!--CONTENT-->
      <div class="btn btn-default edit fr margin-bottom-20">
        <span class="padding-right-5" @click="callEdit">{{$t("button.edit")}}</span>
      </div>
      <!-- <BoxListView :key="listView"></BoxListView> -->
      <div class="wrap_recipes">
          <div class="row0">
              <div class="column1 full fl" 
              v-for="(box, $index) in allBoxInfo" :key="$index"
              @click="callRecipeBox(0)"
              >
                  <div>
                      <div class="wrap_row">
                          <div class="circleNum">{{ box.recipeCnt }}</div>
                          <div class="title">{{ box.name }}</div>
                          <div class="new" v-if="box.new"></div>
                      </div>
                      <div v-if="box.thumbnails">
                          <div class="photo" v-for="(img, $i) in box.thumbnails.slice(0,4)" :key="$i">
                              <img v-if="img.mainImgId != null" class="pic" :src="getImgURL(img.mainImgId)" @error="setEmptyImg">
                              <img v-else class="pic" src="@/assets/emptyImg.png">
                          </div>
                      </div>
                      <div v-else>
                          <div class="photo">
                              <img class="pic" src="@/assets/emptyImg.png">
                              <img class="pic" src="@/assets/emptyImg.png">
                              <img class="pic" src="@/assets/emptyImg.png">
                              <img class="pic" src="@/assets/emptyImg.png">
                          </div>
                      </div>
                  </div>
              </div>
              <div class="column1 fl" 
              v-for="(box, $index) in boxList" :key="$index"
              @click="callRecipeBox(box.id)"
              >
                  <div v-if="!box.isDefault && box.recipe"><!-- 빈 박스(폴더)는 비활성화 -->
                      <div class="wrap_row">
                          <div class="circleNum">{{ box.recipe?box.recipe.length:0 }}</div>
                          <div class="title">{{ box.name }}</div>
                          <div class="new" v-if="box.new"></div>
                      </div>
                      <div v-if="box.recipe">
                          <div class="photo" v-for="(r, $i) in box.recipe.slice(0,1)" :key="$i">
                              <img v-if="r.mainImgId != null" class="pic" :src="getImgURL(r.mainImgId)" @error="setEmptyImg">
                              <img v-else class="pic" src="@/assets/emptyImg.png">
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="wrap_recipes">
          <div class="row0">
              <div class="column1 new fl" v-on:click.capture="addNewBox(boxName)">
                  <div class="wrap_row">
                      <div class="title">{{ $t('content.newBox') }}</div>
                  </div>
                  <div class="photo">
                      <img src="@/assets/images/icon_plus.png" alt="새로운 박스"/>
                  </div>
              </div>
          </div>
      </div>
      <div>
        <infinite-loading @infinite="infiniteHandler">
            <div slot="no-more"><br/></div>
        </infinite-loading>
      </div>
    </main>
    <!--FOOTER-->
  </div>
</template>

<script>
import emptyImg from '@/assets/emptyImg.png'
import ConfirmInput from 'vue-confirm-input'
import InfiniteLoading from 'vue-infinite-loading';

export default {
  name : "RecipeBoxListView",
  data: ()=>({
    page : 0,
    boxList : [],
    recipeBoxes : [],
    allBoxInfo : [],
    boxName: '기본박스',
    recipeId: 0,
    isActive: false,
  }),

  computed: {
    // ...mapGetters('box', ['listView']),
    reversedMesage: {
      get() {
        return this.boxName.split('').reverse().join('')
      },
      set(value) {
        console.log(value)
        this.boxName = value
      }
    }
  },

  watch: {
  }, 

  created() {
    this.initialize();
  },
  
  mounted() {
    this.$checkToken('recipeboxlist');
  },

  components: {
    ConfirmInput,
    InfiniteLoading
},

  methods: {
    initialize() {
      this.getRecipeBoxAll();
    },
    
    async getRecipeBoxAll() {
      let params = '';
        // params += `?page=${this.page}`;
        // params += '&sort=createdAt,DESC';
      const response = await this.$api(`${this.$API_SERVER}/api/reciperecipebox/recipe/mine`+params, "get");
      if (response.status === this.HTTP_OK) {
        this.allBoxInfo = []
        this.recipeBoxes = response.data;

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
        // console.log(this.allBoxInfo)
      }
    },

    async infiniteHandler($state){
      let params = `page=${this.page}`;
        // params += '&sort=createdAt,DESC';
      console.log(params);
      const response = await this.$api(`${this.$API_SERVER}/api/recipebox/mine?`+params, `get`);
      if (response.status === this.HTTP_OK) {
        if(response.data.length){
          console.log(response.data);
          for(const data of response.data){
            this.boxList.push(data);
            // this.setAllBoxInfo();
          }          
          this.page++;
          $state.loaded();
          if(response.data.length / 2 < 1){
            $state.complete();
          }
        }else{
          $state.complete();
        }
      }else{
        console.log(response.status);
        $state.complete();
      }
    },

    callEdit() {
      console.log("Edit");
      // TODO : 폴더 편집 - 폴더명 변경, 삭제, 폴더 새로 만들기 기능
    },

    async addNewBox(name) {
        name = prompt('새 박스 이름를 입력하고 확인버튼을 눌러주세요.', '새 박스 이름');
        if(name === null){
          alert("취소되었습니다.")
          return
        }
        if(name.length < 2 || name.length > 20 || name === ' '){ /* TODO: 특수문자 처리 */
          alert("박스 이름은 공백을 제외한 글자수 2 이상에서 20 이하로 작성해 주세요.")
          return
        }
        console.log("addNewBox : "+name);
        this.boxName = name;
        const response = await this.$api(
          `${this.$API_SERVER}/api/recipebox/${name}`,
          "post"
        );
        if (response.status === this.HTTP_OK) {
            this.selectedRecipeBox = response.data;
        }
        this.initialize();
    },

    setEmptyImg(e) {
      e.target.src=emptyImg;
    },
    
    async getFileId(id){
        const response = await this.$api(
          `${this.$API_SERVER}/file?contentsId=${id}`,
          "get"
        );
        if (response.status === this.HTTP_OK) {
            console.log(response.data);
        }
    },

    getImgURL(id) {
      const url = `${this.$API_SERVER}/file/download/thumbnail?fileId=` + id;
      console.log(url);
      return url
    },

    callRecipeBox(id) {
        location.href=`/recipebox/${id}`;
    },

    activate() {
      this.isActive = !this.isActive
    }
  },
}
</script>

<style scoped>
/* button
{
    background: inherit ; 
    border:none; 
    box-shadow:none; 
    border-radius:0; 
    padding:0; 
    overflow:visible; 
    cursor:pointer
}
ul {
    list-style: none;
}
li {
    float: left;
} */
.active {
  color: orange;
}
/* 
main.recipebox .wrap_recipes .column1.on {width: 50%; }
main.recipebox .wrap_recipes .column1.on .wrap_row {height:24px;}
main.recipebox .wrap_recipes .column1.on .wrap_row .circleNum {position: absolute; margin-top:-7px; z-index: 99999; border-radius: 10px;width:20px;background-color:#FF9519; color: #fff;text-align: center; font-weight: 600;}
main.recipebox .wrap_recipes .column1.on .wrap_row .title     {float: left; z-index: -1;border: 3px #FF9519 solid; border-bottom: none; border-radius: 10px 10px 0 0; padding:0 5px 0 6px; margin-left:13px;background-color:#fff; color: #FF9519;text-align: center;}
main.recipebox .wrap_recipes .column1.on .wrap_row .new       {float: left;margin-top:5px; background: url(../images/bul-new.png)50% 50% no-repeat;width:35px;height: 16px;display:block;}
main.recipebox .wrap_recipes .column1.on .photo     {padding: 0;margin: 0 10px 0 0; display:block; border: 3px #FF9519 solid; border-radius: 5px; box-shadow: 2px 2px 2px 0 #ccc;}
main.recipebox .wrap_recipes .column1.on .photo img {width: 100%; height: 100%;}
*/
</style>