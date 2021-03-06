import React, { Component } from 'react';
import './SingerDetail.scss';
import { CSSTransition } from 'react-transition-group';
import { getSingerDetail } from 'api/singer';
import { connect } from 'react-redux';
import SingerClass from 'common/js/singer.js';
import { ERR_OK } from 'api/config';
import MusicList from 'components/music-list/MusicList';
import { createSong } from 'common/js/song.js';
import { withRouter } from 'react-router';
import {
  ISong, IStoreState, ISinger
} from 'store/stateTypes';
interface singerDetailStateType {
  showMusicList: boolean;
  songs: Array<ISong>;
}

interface singerDetailPropsType {
  singer: ISinger;
  history: any;
  location: any;
  match: any;
}

class SingerDetailBase extends Component<singerDetailPropsType, singerDetailStateType> {
  unmountedFlag: boolean;
  constructor(props: singerDetailPropsType) {
    super(props);
    this.unmountedFlag = false;
    this.state = {
      showMusicList: true,
      songs: []
    }
  }

  back = () => {
    this.setState({
      showMusicList: false
    })
  }

  componentDidMount() {
    if (this.props.singer && this.props.singer.id < 0) {
      this.props.history.push('/singer');
      return;
    }
    this._getSingerDetail();
  }
  componentWillUnmount() {
    this.unmountedFlag = true;
  }

  _getSingerDetail = () => {
    getSingerDetail(this.props.singer.id).then((res) => {
      if (res.code === ERR_OK && !this.unmountedFlag) {
        this.setState({
          songs: this._normalizeSongs(res.data.list)
        })
      }
    })
  }
  _normalizeSongs(list: Array<any> ) {
    let ret: any = [];
    list.forEach((item) => {
      let { musicData } = item;
      if (musicData.songid && musicData.albummid) {
        ret.push(createSong(musicData));
      }
    })
    return ret;
  }
  render() {
    const { singer } = this.props;
    const { songs, showMusicList } = this.state;
    return (
      <CSSTransition
      classNames="singer-detail-transition"
      in={showMusicList}
      timeout={500}
      appear={true}
      unmountOnExit
      onExited = { () => {
        this.props.history.goBack();
      }}>
        <MusicList 
        singerName={singer.name} 
        bgImage={singer.avatar}
        songs={songs}
        back={this.back} />

      </CSSTransition>
    )
  }
}

const mapStateToProps = (state: IStoreState) => ({
  singer: state.singer
})
const SingerDetail = withRouter(connect(mapStateToProps)(SingerDetailBase));

export default SingerDetail;
