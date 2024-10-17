import {RouteObject} from 'react-router-dom'
import CommonModel from './common-model'
import PageModel from './page-model'

const routes: RouteObject[] = [...CommonModel,...PageModel]


export default routes
