import React from 'react';
import Loader from 'react-loader-spinner'


class SpinnerComponent extends React.Component {
	state = {
		loading: true
	};
	render() {
		return (
			<div className='sweet-loading' >
				<Loader
					// className="clip-loader"
					// sizeUnit={"px"}
					// size={60}
					color={'#FF586B'}
					// loading={this.state.loading}

				/>
			</div>
		)
	}
}

export default SpinnerComponent;