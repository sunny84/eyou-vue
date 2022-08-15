<template>
    <div>
        <div class="wrap_recipes">
            <div class="row0">
                <div class="column1 full fl" 
                v-for="(box, $index) in boxList" :key="$index"
                @click="callRecipeBox(box.id)"
                >
                    <div v-if="box.isDefault"><!-- 모아보기 -->
                        <div class="wrap_row">
                            <div class="circleNum">{{ box.recipe?box.recipe.length:0 }}</div>
                            <div class="title">{{ box.name }}</div>
                            <div class="new" v-if="box.new"></div>
                        </div>
                        <div v-if="box.recipe">
                            <div class="photo" v-for="(r, i) in box.recipe.slice(0,4)" :key="i">
                                <img v-if="r.mainImgId != null" class="pic" :src="getImgURL(r.mainImgId)" @error="setEmptyImg">
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
                <div class="column1 full fl" 
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
                            <div class="photo" v-for="(r, i) in box.recipe.slice(0,1)" :key="i">
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
    </div>
</template>
<script>
import InfiniteLoading from 'vue-infinite-loading';
import emptyImg from "@/assets/emptyImg.png";
// import { mapGetters } from "vuex";
export default {
  name : "BoxListView",
  data: ()=>({
    page : 0,
    boxList : [],
    boxName: '기본박스',
  }),

  computed : {  
    // ...mapGetters('box', ['listView']),
    // ...mapGetters('filter', ['listView']),
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

  components: {
    InfiniteLoading
  },

  methods:{
    
    getImgURL(id) {
      const url = `${this.$API_SERVER}/file/download/thumbnail?fileId=` + id;
      console.log(url);
      return url
    },

    setEmptyImg(e) {
      e.target.src = emptyImg;
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
        location.href=this.$route.path;
    },

    callRecipeBox(id) {
        location.href=`/recipebox/${id}`;
    },
  },
}
</script>