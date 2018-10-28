import React, { Component } from 'react';
import PropTypes from "prop-types";

import PrismaCmsApp from '@prisma-cms/front'
import { Renderer as PrismaCmsRenderer } from '@prisma-cms/front'

import * as queryFragments from "@prisma-cms/front/lib/schema/generated/api.fragments";

import App from "../App";


class DevRenderer extends PrismaCmsRenderer {


  static propTypes = {
    ...PrismaCmsRenderer.propTypes,
    pure: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    ...PrismaCmsRenderer.defaultProps,
    pure: true,
  }

  getRoutes() {

    return [{
      exact: true,
      path: "/",
      component: App,
    }, {
      path: "*",
      render: props => this.renderOtherPages(props),
    },];

  }


  render() {

    const {
      pure,
      ...other
    } = this.props;

    return pure ? <App
      content={`<p>Test content</p>`}
      allow_edit={true}
      inEditMode={true}
      onChange={(state, rawContent) => {
        // console.log("onChange newState", state);
        // console.log("onChange rawContent", rawContent);
      }}
      Send={event => {
        console.log("Send", event);
      }}
      {...other}
    /> : super.render();

  }

}

export default class DevApp extends Component {

  static propTypes = {
    queryFragments: PropTypes.object.isRequired,
  }

  static defaultProps = {
    queryFragments,
    lang: "ru",
  }

  render() {

    const {
      queryFragments,
      ...other
    } = this.props;

    return <PrismaCmsApp
      queryFragments={queryFragments}
      Renderer={DevRenderer}
      // pure={true}
      {...other}
    />
  }
}

