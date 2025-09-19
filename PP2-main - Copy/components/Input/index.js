import React from "react";

class Input extends React.Component {
  render() {
    return (
      <label>
        {this.props.label}
        <input
          type="text"
          value={this.props.value}
          onChange={(e) => this.props.onChange(e.target.value)}
        />
      </label>
    );
  }
}

export default Input;