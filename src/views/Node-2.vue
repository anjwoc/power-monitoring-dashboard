<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <toggle-switch :nodeTitle="nodeTitle"></toggle-switch> 
      </v-col>
      <v-col
        cols="12"
        lg="12"
      >
        <material-chart-card
          :data="realTimeChart.data"
          :options="realTimeChart.options"
          color="green"
          type="Line"
        >
          <h3 class="title font-weight-light">
            Real-time usage chart
          </h3>
          <p class="category d-inline-flex font-weight-light">
            실시간 사용량 차트<br/>
            Recent eight Data
          </p>

          <template v-slot:actions>
            <v-icon
              class="mr-2"
              small
            >
              mdi-clock-outline
            </v-icon>
            <span class="caption grey--text font-weight-light">updated 1 minutes ago</span>
          </template>
        </material-chart-card>
      </v-col>


    <v-col
      cols="12"
    >
      <material-chart-card
          :data="MonthlyAverageChart.data"
          :options="MonthlyAverageChart.options"
          :responsive-options="totalUsageEachNodeChart.responsiveOptions"
          color="danger"
          type="Bar"
        >
          <h4 class="title font-weight-light">
            Total monthly usage this year
            
          </h4>
          <p class="category d-inline-flex font-weight-light">
            이번 년도 월별 총 사용량<br/>( 1월~12월 )<br/>[ 단위: KW ]
          </p>

          <template v-slot:actions>
            <v-icon
              class="mr-2"
              small
            >
              mdi-clock-outline
            </v-icon>
            <span class="caption grey--text font-weight-light">updated on refresh</span>
          </template>
        </material-chart-card>
      </v-col>

      <v-col
        cols="12"
        lg="6"
      >
        <material-chart-card
          :data="totalUsageEachNodeChart.data"
          :options="totalUsageEachNodeChart.options"
          :responsive-options="totalUsageEachNodeChart.responsiveOptions"
          color="red"
          type="Bar"
        >
          <h4 class="title font-weight-light">
            Total Usage for Each Node <br/> 
            
          </h4>
          <p class="category d-inline-flex font-weight-light">
            각 노드별 일일 총 사용량<br/>
            Recent 24 hours
          </p>

          <template v-slot:actions>
            <v-icon
              class="mr-2"
              small
            >
              mdi-clock-outline
            </v-icon>
            <span class="caption grey--text font-weight-light">updated on refresh</span>
          </template>
        </material-chart-card>
      </v-col>


      <v-col
        cols="12"
        lg="6"
      >
        <material-chart-card
          :data="totalUsageDayChart.data"
          :options="totalUsageDayChart.options"
          color="warning"
          type="Line"
        >
          <h4 class="title font-weight-light">
            Total Usage by Day of the Month
          </h4>

          <p class="category d-inline-flex font-weight-light">
            이번 달 요일 별 총 사용량
          </p>

          <template v-slot:actions>
            <v-icon
              class="mr-2"
              small
            >
              mdi-clock-outline
            </v-icon>
            <span class="caption grey--text font-weight-light">updated on refresh</span>
          </template>
        </material-chart-card>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        lg="6"
      >
        <material-stats-card
          color="green"
          icon="mdi-power-plug"
          title="Real-time electric Fee"
          v-model="this.fee"
          sub-icon="mdi-square-inc-cash"
          sub-text="이번 달 전기요금(현재 사용량을 유지할 경우 나오는 예상치)"
        >
        </material-stats-card>
      </v-col>

      <v-col
        cols="12"
        sm="6"
        lg="6"
      >
        <material-stats-card
          color="orange"
          icon="mdi-flash"
          title="electricity usage"
          v-model="this.totalUsage_mA"
          small-value="W"
          sub-icon="mdi-flash"
          sub-icon-color="error"
          sub-text="일일 누적 전기 사용량"
          sub-text-color="text-primary"
        />
      </v-col>
 
      <v-col
        cols="12"
        lg="6"
      >
        <material-card
          color="orange"
          title="Node Stats"
          text="노드 정보"
        >
        <v-data-table
            :headers="nodeStatHeaders"
            :items="nodeStatItems"
            hide-default-footer
          /> 
        </material-card>
      </v-col>


      <v-col
        cols="12"
        lg="6"
      >
        <material-card
          color="primary"
          title="Recent 20 Data"
          text="최근 20개 데이터"
        >
        <v-data-table
            :headers="recentItemHeaders"
            :items="recentItems"
            hide-default-footer
        />

        </material-card>
      </v-col>
    </v-row>
    
  </v-container>


</template>
  <script>
  import axios from 'axios';
  import dotenv from 'dotenv';
  import ToggleSwitch from './ToggleSwitch_2';
  import {
      mapState,
      mapMutations,
      mapActions,
  }from 'vuex';
  dotenv.config();
  export default {
    data () {
      return {
        nodeTitle: '',
        fee: 0,
        electricityUsage: 0,
        totalUsage_mA: 0,
        totalUsageDayChart: {
          data: {
            labels: [],
            series: [
              []
            ]
          },
          options: {
            lineSmooth: this.$chartist.Interpolation.cardinal({
              tension: 0
            }),
            low: 0,
            high: 600, 
            chartPadding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 10
            }
          }
        },
        realTimeChart: { 
          data: {
            labels: [],
            series: [
              []
            ]
          },
          options: {
            lineSmooth: this.$chartist.Interpolation.cardinal({
              tension: 0
            }),
            low: 0,
            high: 250, 
            chartPadding: {
              top: 0,
              right: 5,
              bottom: 5,
              left: 5
            }
          }
        },
        totalUsageEachNodeChart: {
          data: {
            labels: [],
            series: [
              []
              ]            
          },
          options: {
            axisX: {
              showGrid: false
            },
            low: 0,
            high: 150,
            chartPadding: {
              top: 0,
              right: 5,
              bottom: 0,
              left: 0
            }
          },
          responsiveOptions: [
            ['screen and (max-width: 640px)', {
              seriesBarDistance: 5,
              axisX: {
                labelInterpolationFnc: function (value) {
                  return value[0]
                }
              }
            }]
          ]
        },
        MonthlyAverageChart: {
          data: {
            labels: [],
            series: [
              []
              ]            
          },
          options: {
            axisX: {
              showGrid: false
            },
            low: 0,
            high: 330,
            chartPadding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 20
            }
          },
          responsiveOptions: [
            ['screen and (max-width: 640px)', {
              seriesBarDistance: 5,
              axisX: {
                labelInterpolationFnc: function (value) {
                  return value[0]
                }
              }
            }]
          ]
        },
        nodeStatHeaders: [
          {
            sortable: false,
            text: 'Mac',
            value: 'mac'
          }
        ],
        recentItemHeaders: [
          {
            sortable: false,
            text: 'InsertedAt',
            value: 'insertedAt'
          },
          {
            sortable: false,
            text: 'Mac',
            value: 'mac'
          },
          {
            sortable: false,
            text: 'No',
            value: 'no',
            align: 'right'
          },
          
          {
            sortable: false,
            text: 'A',
            value: 'a',
            align: 'right'
          },
          {
            sortable: false,
            text: 'W',
            value: 'w',
            align: 'right'
          }
        ],
        recentItems: [],
        nodeStatItems: [],
        tabs: 0,
        list: {
          0: false,
          1: false,
          2: false
        }
      }
    },
    components:{
      ToggleSwitch,
    },
    computed:{
      ...mapState({
        me : state=>state.users.me,
        }),
      ...mapActions('users', {

      })
    },
    watch: {
      '$route' (to, from){
        //경로 변경에 반응해서 실행
        this.$socket.emit('nodeId', '2');
        this.onMounted();
      },
    },
    mounted(){
      this.nodeTitle = (this.$route.path === '/') ? 'node-1' : this.$route.path.slice(1);
      console.log(this.nodeTitle);
      this.$socket.emit('nodeId', '2');
      this.onMounted();
    },
    methods: {
      complete (index) {
        this.list[index] = !this.list[index]
      },
      onMounted(){
        axios.get('http://13.125.115.145:3085/sensor/sum_24h/1')
        .then((res)=>{
          let data = res.data;
          for(let i=0;i<data.length;i++){
            const {mac, W} = data[i];
            console.log("mac, W")
            console.log(mac, W);
            W = W/1000;
            this.totalUsageEachNodeChart.data['series'][0].push(W);
            this.totalUsageEachNodeChart.data['labels'].push(mac);           
          }
          console.log(this.totalUsageEachNodeChart.data);
          console.log(typeof(this.sumChartData));
        })
        .catch((err)=>{
          console.error(err);
        });
        axios.get('http://13.125.115.145:3085/sensor/acc_1m/1')
        .then((res)=>{
          let data = res.data;
          for(let i=0;i<data.length;i++){
            this.totalUsageDayChart.data['labels'].push(data[i]['day']);
            this.totalUsageDayChart.data['series'][0].push(data[i]['합계']);
          }
          console.log(this.totalUsageDayChart.data);
          console.log(typeof(this.totalUsageDayChart.data));

        })
        .catch((e)=>{
          console.error(e);
        });
        axios.get('http://13.125.115.145:3085/sensor/Avg_Months/1')
        .then((res)=>{
          let data = res.data;
          console.log("test--------------------------------")
          console.log(data);
          for(let i=0;i<data.length;i++){
            this.MonthlyAverageChart.data['labels'].push(data[i]['dt']);
            this.MonthlyAverageChart.data['series'][0].push(data[i]['kw']);
          }
          console.log(this.MonthlyAverageChart.data);
        })
        .catch((e)=>{
          console.error(e);
        });
        axios.get('http://13.125.115.145:3085/sensor/recent_20/1')
        .then((res)=>{
          let data = res.data;
          this.recentItems = data;

        })
        .catch((e)=>{
          console.error(e);
        });

        axios.get('http://13.125.115.145:3085/sensor/nodeStat')
        .then(res=>{
          let data = res.data;
          this.nodeStatItems = data;
        })
        .catch(e=>{
          console.error(e);
        });

      }
    },
    sockets:{
      realtimeChartLabels(labels) {
        this.realTimeChart.data['labels'] = labels;
      },
      realtimeChartSeries(series){
        this.realTimeChart.data['series'][0] = series;
      },
      electricFee(fee){
        this.fee = "￦"+fee;
      },
      totalUsage(usage){
        this.totalUsage_mA = usage;
      }
    }
    
  }
</script>
