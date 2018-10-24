
'use strict';

import React from 'react';


import Dialog, { DialogActions, DialogContent } from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import './styles/styles.less';
import withStyles from 'material-ui/styles/withStyles';


const propTypes = {
};

const defaultProps = {
  open: false,
};

const styles = (theme) => {

  return {
    root: {
    },
    dialog: {
      '& .dialog-paper': {
        maxWidth: '90%',
        width: 'auto',
      },
    },
    dialogContent: {
    },

    thumb: {
    },
    img: {
      maxWidth: "100%",
    },
  };

};


export class ImageBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      original_url: props.block.data.get("original_url"),
      src: props.block.data.get("url"),
      open: props.open,
    };
  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };


  render() {


    if (!this.state.src) {
      return null;
    }

    const {
      classes,
    } = this.props;

    return (
      <div className={["editor-image__wrapper", classes.root].join(" ")}>
        <div className="editor-image__anchore_wrapper">
          {this.state.original_url ? <a href={this.state.original_url} target="_blank" rel="nofollow">
            {this.state.original_url}
          </a> : null
          }
        </div>
        <img
          className={["editor-image thumb", classes.img, classes.thumb].join(" ")}
          src={this.state.src}
          onClick={this.handleOpen}
        />

        <Dialog
          className={[classes.dialog].join(" ")}
          onRequestClose={this.handleClose}
          open={this.state.open}
          paperClassName="dialog-paper"
        >

          <DialogContent
            className={[classes.dialogContent].join(" ")}
          >
            <img
              className={["editor-image opened", classes.img].join(" ")}
              src={this.state.src}
            />
          </DialogContent>

          <DialogActions>
            <Button
              key="close"
              onClick={this.handleClose}
            >Закрыть</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ImageBlock.propTypes = propTypes;
ImageBlock.defaultProps = defaultProps;

export default withStyles(styles)(ImageBlock);
