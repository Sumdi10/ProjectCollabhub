import React, { Component } from "react";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ModalWindow extends Component {
  state = {};

  render() {
    return (
      <React.Fragment>
        <Modal
          isOpen={this.props.modal}
          toggle={this.props.toggleModal}
          size={this.props.size}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          className={this.props.className}
          contentClassName={this.props.contentClassName}
          keyboard={this.props.useKeyBoard === "no" ? false : true}
        >
          <ModalHeader toggle={this.props.toggleModal}>
            {this.props.modalHeader}
          </ModalHeader>
          <ModalBody
            style={{
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            {this.props.modalBody}
          </ModalBody>
          {this.props.modalFooter ? (
            <ModalFooter>{this.props.modalFooter}</ModalFooter>
          ) : null}
        </Modal>
      </React.Fragment>
    );
  }
}

export default ModalWindow;
