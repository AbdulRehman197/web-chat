import React from 'react';
import { connect } from "react-redux";

class About extends React.Component {

    render() {

        return (
        <div className="About Page">
            <h2>About JChat</h2>
            <p>Built by Surevine</p>
        </div>
        );
    }

}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps, {})(About);