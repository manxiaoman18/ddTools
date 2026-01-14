import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import DataToolView from '../views/DataToolView.vue'
import ImageToolView from '../views/ImageToolView.vue'
import DateToolView from '../views/DateToolView.vue'
import WorkTimeCalcView from '../views/WorkTimeCalcView.vue'
import CodeDiffToolView from '../views/CodeDiffToolView.vue'
import RevertDataView from '../views/RevertDataView.vue'
import XunFeiAIView from '../views/XunFeiAIView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/dataTool', component: DataToolView },
  { path: '/imageTool', component: ImageToolView },
  { path: '/dateTool', component: DateToolView },
  { path: '/workTimeCalcCode', component: WorkTimeCalcView },
  { path: '/codeDiffTool', component: CodeDiffToolView },
  { path: '/revertData', component: RevertDataView },
  { path: '/xunFeiAI', component: XunFeiAIView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router