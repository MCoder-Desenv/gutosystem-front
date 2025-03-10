interface LoaderProps {
    show: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ show }) => {

    if(!show){
        return <></>
    }

    return (
        <div id="loader" style={{
            width: '100%',
            height: '100%',
            zIndex: 99999,
            position: 'absolute',
            left: '20%',
            top: '30%'
            }}>
            <div 
                style={{
                    position: 'absolute',
                    left:'20%',
                    top:'30%' 
                }}>
                    <div className="loadingio-spinner-spinner-nq4q5u6dq7r"><div className="ldio-x2uulkbinbj">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    </div></div>
            </div>
        </div>
    )
}