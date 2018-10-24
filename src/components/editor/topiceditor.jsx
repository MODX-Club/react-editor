import React, {Component} from 'react';

import PropTypes from 'prop-types';

import TextEditor from './index';
import Chip from 'material-ui/Chip';
import AutoComplete from '../AutoComplete';

import {Link} from 'react-router-dom';

import { CONNECTOR_URL } from '../const/';

import lodash from 'lodash';

let propTypes = TextEditor.propTypes && lodash.cloneDeep(TextEditor.propTypes) || {};

Object.assign(propTypes, {
  setFullView: PropTypes.func.isRequired,
});

export default class TopicEditor extends TextEditor{

  static propTypes = propTypes;

  constructor(props){

    super(props);

    // console.log("this.state", this.state);

    this.state.document = props.document;
    this.state.tags = props.document.topic_tags || [];
    this.state.validTags = props.validTags || [];

  }

  getAction(){
    return !this.state.id ? 'topics/create' : 'topics/update';
  }

  componentDidUpdate(prevProps, prevState){
    if(
      this.state.inEditMode === true
      && prevState.inEditMode != this.state.inEditMode
    ){
      this.loadTags();
    }

    return true;
  }

  componentDidMount(){
    if(this.state.inEditMode === true){
      this.loadTags();
    }
  }

  prepareRequestData(data){
    // alert(data);

    Object.assign(data, {
      content: data.text,
      pagetitle: this.props.pagetitle,
      topic_tags: this.state.tags,
    });

    // console.log('prepareRequestData', data);

    return data;
  }

  handleRequestDelete = (key) => {
    // console.log('key', key);

    // if (key === 3) {
    //   alert('Why would you want to delete React?! :)');
    //   return;
    // }
    //
    // this.chipData = this.state.chipData;
    // const chipToDelete = this.chipData.map((chip) => chip.key).indexOf(key);
    // this.chipData.splice(chipToDelete, 1);
    // this.setState({chipData: this.chipData});

    this.setState((prevState) => {
      var tags = prevState.tags;

      if(tags.length){
        var i = 0;

        tags.map(function(item){

          if(item === key){
            tags.splice(i, 1);
            i--;

            return false;
          }

          i++;

        });
      }

      return {
        tags: tags,
      };
    });
  };

  getTags(){

    var tags = [];

    if(this.state.tags && this.state.tags.length){
      this.state.tags.map(function(tag){
        tags.push(<Link
          key={tag}
          to={`/tag/${tag}`}
          href={`/tag/${tag}`}
          className="underline-none"
        >  
          <Chip
            label={tag}
            style={{
              margin: 3,
            }}
            className="link"
            onRequestDelete={this.state.inEditMode === true ? () => this.handleRequestDelete(tag) : null}
          >
          </Chip>
        </Link>
        );
      }, this);
    }

    var dataSource = [];

    this.state.validTags.map(function(item){
      dataSource.push(item);
    });

    dataSource.push(this.state.raw_tag);

    return tags.length || this.state.inEditMode === true ? <div>
        {this.state.inEditMode === true ? <AutoComplete
            label="Укажите теги"
            error={this.state.errors.topic_tags && this.state.errors.topic_tags != ""}
            onFocus={() => {this.clearError()}}
            filter={AutoComplete.caseInsensitiveFilter}
            maxSearchResults={10}
            searchText={this.state.searchText}
            dataSource={dataSource}
            onNewRequest={(value)=>{
              this.setState((prevState) => {

                var tags = prevState.tags || [];

                tags.push(value);

                return {
                  tags: tags,
                  test: value,
                  searchText: "",
                };
              });
            }}
            onUpdateInput={(value)=>{
              console.log('onUpdateInput', value);
              this.setState({
                raw_tag: value,
                searchText: value,
              });
            }}
          /> : null}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          {tags}

        </div>
      </div>
      : null;
  }

  loadTags(){
    if(!this.state.validTags || !this.state.validTags.length){
      var body = new FormData();

      var data = {
        format: "json",
        limit: 0,
      };

      for(var i in data){
        var value = data[i];

        body.append(i, value);
      };


      this.setState({
      });

      fetch(CONNECTOR_URL +'?pub_action=tags/getdata',{
        credentials: 'same-origin',
        method: "POST",
        body: body,
      })
        .then(function (response) {

          return response.json()
        })
        .then(function (data) {


          if(data.success == true && data.object){

            var tags = [];

            data.object.map(function(item){
              tags.push(item.tag);
            });

            var newState = {
              validTags: tags,
            };
            this.setState(newState);
          }
          else{
            console.error(data.message || "Ошибка выполнения запроса");
          }



        }.bind(this))
        .catch(function (error) {
            console.error('Request failed', error);
          }
        );
    }
  }

}