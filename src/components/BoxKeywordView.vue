<template>
    <div><!-- test ok -->
        <div class="wrap-boxes">
            <div class="boxes">
                <swiper class="wrap_keywords" ref="filterSwiper" :options="swiperOption" role="tablist">                    
                    <swiper-slide role="tab">
                        <div class="keywords" 
                            :class="{on : step==4}">
                            <button @click="recipeAll()">모든 레시피</button>
                        </div>
                    </swiper-slide>
                    <swiper-slide role="tab" 
                        v-for="(box, index) in boxList"
                        v-if="box.isDefault === false"
                        :key="index">
                        <div class="keywords" 
                                :class="{on : selectedRecipeBoxIds.includes(box.id) || boxId == box.id}" 
                                @click="setSelectedRecipeBox(box.id)">
                            <span>
                                {{box.name}}
                            </span>
                        </div>
                    </swiper-slide>
                    <swiper-slide role="tab">
                        <div class="keywords" 
                            :class="{on : step==3}">
                            <button @click="addNewBoxPage()">{{ $t('button.addNewBox') }} +</button>
                        </div>
                    </swiper-slide>
                </swiper>
                <!-- ////<div class="wrapper">
                <div class="swiper-pagination" slot="pagination"></div>
                <div class="swiper-button-prev" slot="button-prev"></div>
                <div class="swiper-button-next" slot="button-next"></div>
                </div>//// -->
                <div>
                <infinite-loading @infinite="infiniteHandler">
                    <div slot="no-more"><br/></div>
                </infinite-loading>
                </div>
            </div>
            <div>
                <span>선택된 레시피박스: {{ selectedRecipeBox.name }}[{{ selectedRecipeBox.id }}]</span>
            </div>
        </div>
    </div>
</template>
<script>
import InfiniteLoading from 'vue-infinite-loading';
import emptyImg from "@/assets/emptyImg.png";
import { mapActions, mapGetters } from "vuex";
import { swiper, swiperSlide } from "vue-awesome-swiper";
import "swiper/dist/css/swiper.min.css";
export default {
  name : "BoxKeywordView",
  data: ()=>({
    page : 0,
    // step : 0,
    boxList : [],
    boxName: '기본박스',
    selectedRecipeBox : [],
    selectedRecipeBoxIds : [],
    // boxId : 0,
    swiperOption: {
        slidesPerView: 4,   // 'auto'
        spaceBetween: 0,   // swiper-slide 사이의 간격 지정
        slidesOffsetBefore: 0, // slidesOffsetBefore는 첫번째 슬라이드의 시작점에 대한 변경할 때 사용
        slidesOffsetAfter: 0, // slidesOffsetAfter는 마지막 슬라이드 시작점 + 마지막 슬라이드 너비에 해당하는 위치의 변경이 필요할 때 사용
        freeMode: true, // freeMode를 사용시 스크롤하는 느낌으로 구현 가능
        centerInsufficientSlides: true, // 컨텐츠의 수량에 따라 중앙정렬 여부를 결정함
        slideToClickedSlide: true,
    },
  }),

  computed : {  
    ...mapGetters('box', ['listView','step','boxId']),
    reversedMesage: {
      get() {
        return this.boxName.split('').reverse().join('')
      },
      set(value) {
        console.log(value)
        this.boxName = value
      }
    },
    swiper() {
        console.log("computed:swiper");
        return this.$refs.filterSwiper.swiper;
    },
  },

  components: {
    swiper,
    swiperSlide,
    InfiniteLoading
  },

    created() {
        // this.boxId = this.$route.params.boxId;
        this.initialize();
    },
    
  methods:{
    ...mapActions('box', ['setStep', 'setBoxId']),
    initialize(){
        this.$store.commit('box/setBoxId', this.$route.params.boxId);
        this.getRecipeBoxById(this.boxId)
    },
    
    getImgURL(id) {
      const url = `${this.$API_SERVER}/file/download/thumbnail?fileId=` + id;
      console.log(url);
      return url
    },

    setEmptyImg(e) {
      e.target.src = emptyImg;
    },

    setSelectedRecipeBox(id) {
        let index = this.selectedRecipeBoxIds.findIndex(x => x === id);
        if(index>=0) {
            this.selectedRecipeBoxIds.splice(index, 1);
        }else{
            this.selectedRecipeBoxIds = []
            this.selectedRecipeBoxIds.push(id);
        }
        this.selectRecipeBox(id)
    },

    selectRecipeBox(id) {
        console.log(`selectRecipeBox: ${id} boxId: ${this.boxId}`);
        location.href=`/recipebox/${id}`;
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

    addNewBoxPage() {
        console.log("addNewBoxPage step=2")
        this.$store.commit('box/setStep', 3);
        this.$store.commit('box/setBoxId', 0);
    },

    callRecipeBox(id) {
        location.href=`/recipebox/${id}`;
    },

    recipeAll() {
        this.$store.commit('box/setStep', 4);
        this.$store.commit('box/setBoxId', 0);
    }
  },
}
</script>
<style scoped>
button
{
    background: inherit ; 
    border:none; 
    box-shadow:none; 
    border-radius:0; 
    padding:0; 
    overflow:visible; 
    cursor:pointer
}
</style>