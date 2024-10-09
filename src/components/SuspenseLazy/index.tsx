import React, {Suspense, lazy} from 'react'

const SuspenseLazy = (props: any) => {
    return (
        <Suspense fallback={'loading...'}>
            {React.createElement(lazy(props))}
        </Suspense>
    )
}

export default SuspenseLazy
