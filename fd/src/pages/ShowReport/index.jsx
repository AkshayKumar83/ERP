import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import ButtonUi from '../../components/basic/button';
// // import styles from './style.module.scss'

// const ShowReport = () => {
//     useEffect(() => {
//         // Redirect to the PHP page
//         window.location.href = "http://192.168.1.125:80/EDDAL/Member%27s_reports/form_members_report.PHP";
//     }, []);

//     return <div>Redirecting to the report...</div>;
// };

// export default ShowReport;


// #### USING window.location.replace ---> WHICH MAKES USER TO GET INSIDE THE REACT APP AFTER CLICK ON BACK BTN OF BROWSER
// const ShowReport = () => {
//     useEffect(() => {
//         // Use replace to prevent back navigation
//         window.location.replace("http://192.168.1.125:80/EDDAL/Member%27s_reports/form_members_report.PHP");
//     }, []);

//     return <div>Redirecting to the report...</div>;
// };

// export default ShowReport;


// #### USING IFRAM ---> WHICH MAKES USING REPORT INSIDE OUR APP

const ShowReport = ({url= '',}) => {
    const { user } = useSelector((state) => state.auth);
    console.log('showReport::', user)
    return (
        <div>
            {/* <h1>Report</h1> */}
            <iframe
                src={`${url}?pTrans_year=${user?.global_fin_year}&pDivision_id=${user?.global_division_id}&pUser_id=${user?.id}`} 
                width="99%" 
                height="570px" 
                title="member report"
                />
                <ButtonUi color="danger" className='ms-auto'>
                    Exit
                </ButtonUi>
        </div>
        
    );
};

export default ShowReport;


// #### USING THIS ---> THE USER WILL REDIRECT TO THIS PAGE WITH ANTOTHER TAB
// const ShowReport = () => {
//     useEffect(() => {
//         // Open the report URL in a new tab
//         window.open("http://192.168.1.125:80/EDDAL/Member%27s_reports/form_members_report.PHP", "_blank");
//     }, []);

//     return <div>Redirecting to the report...</div>;
// };

// export default ShowReport;
