import React, {Suspense, lazy} from 'react'
import {DotLoading} from 'antd-mobile'

const SuspenseLazy = (props: any) => {
    return (
        <Suspense fallback={<DotLoading color='primary' />}>
            {React.createElement(lazy(props))}
        </Suspense>
    )
}

export default SuspenseLazy
