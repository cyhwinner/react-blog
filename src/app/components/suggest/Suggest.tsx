import React, { Component } from 'react';
import Loading from 'reuse/loading/Loading';
import NoResult from 'reuse/no-result/NoResult';
import Scroll from 'reuse/scroll/Scroll';
import './Suggest.scss';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { setSinger } from 'actions/singer';
import {
  setPlaying,
  setFullScreen,
  setSequenceList,
  setPlaylist,
  setCurrentIndex
} from 'actions/player';
import SingerClass from 'common/js/singer.js';
import {
  ISong,
  IPlaying,
  ICurrentIndex,
  IMode,
  IPlaylist,
  ISequenceList,
  IFullScreen,
  IStoreState,
  ISinger
} from 'store/stateTypes';
import { Dispatch } from 'redux';
import { fullScreen, playlist, sequenceList } from 'src/app/reducers/player';
const TYPE_SINGER = 'singer';

interface SuggestPropType {
  result: Array<any>;
  suggestHandler: Function;
  hasMore: boolean;
  page: number;
  history: any;
  setSinger: Function;
  setPlaying: Function;
  setFullScreen: Function;
  setSequenceList: Function;
  setPlaylist: Function;
  setCurrentIndex: Function;
  fullScreen: IFullScreen;
  playlist: IPlaylist;
  currentIndex: ICurrentIndex;
  playing: IPlaying;
  sequenceList: IPlaylist;
  saveSearch: Function;
}

interface SuggestStateType {

}

class Suggest extends Component<SuggestPropType, SuggestStateType> {
  suggest: React.RefObject<Scroll>;
  constructor(props: SuggestPropType) {
    super(props);
    this.suggest = React.createRef();
  }
  getIconCls = (item: any) => {
    if (item.type === TYPE_SINGER ) {
      return 'icon-mine';
    } else {
      return 'icon-music';
    }
  }
  componentDidUpdate() {
    if (this.props.page === 1 && this.suggest.current) {
      this.suggest.current.scrollTo(0, 0);
    } 
  }
  findIndex =(list: ISequenceList, song: ISong) => {
    return song && list.findIndex((item) => item.id === song.id);
  }
  insertSong = (song: ISong) => {
    let playlist = this.props.playlist.slice();
    let sequenceList = this.props.sequenceList.slice();
    let currentIndex = this.props.currentIndex;
    let currentSong = playlist[currentIndex];
    let fpIndex = this.findIndex(playlist, song);
    currentIndex++;
    playlist.splice(currentIndex, 0, song);
    if (fpIndex > -1) {
      if (currentIndex > fpIndex) {
        playlist.splice(fpIndex, 1);
        currentIndex--;
      }
    }
    let currentSIndex = this.findIndex(sequenceList, currentSong) + 1;
    let fsIndex = this.findIndex(sequenceList, song);
    sequenceList.splice(currentSIndex, 0, song);
    if (fsIndex > -1) {
      if (currentSIndex > fsIndex ) {
        sequenceList.splice(fsIndex, 1)
      }
    }

    this.props.setPlaylist(playlist);
    this.props.setSequenceList(sequenceList);
    this.props.setCurrentIndex(currentIndex);
    this.props.setFullScreen(true);
    this.props.setPlaying(true);
  }
  selectItem = (item: any) => {
    if (item.type === TYPE_SINGER) {
      const singer = new SingerClass({
        id: item.singerMID,
        name: item.singerName
      })
      this.props.history.push(`/search/${singer.id}`);
      this.props.setSinger(singer);
    } else  {
      this.insertSong(item);
    }
    this.props.saveSearch();
  }
  getDisplayName = (item: any) => {
    if (item.type === TYPE_SINGER) {
      return item.singerName;
    }
    return `${item.name} - ${item.singer}`;
  }
  pullUpHandler = () => {
    this.props.suggestHandler();
  }
  render() {
    const { result, hasMore } = this.props;
    return (
      <Scroll
        probeType={1}
        pullUp={true}
        pullUpHandler={this.pullUpHandler}
        className="suggest"
        ref={this.suggest}>
        <ul className="suggest-list">
          {
            !!result.length && result.map((item, index) => (
              <li 
                key={index}
                className="suggest-item"
                onClick={() => {this.selectItem(item)}}>
                  <div className="icon">
                    <i className={this.getIconCls(item)} />
                  </div>
                  <div className="name">
                    <p className="text">{this.getDisplayName(item)}</p>
                  </div>
                </li>
            ))
          }
          {
            hasMore && <Loading />
          }
        </ul>
        <div className="no-result-wrapper" style={{display: (!hasMore && !result.length) ? "" : "none"}}>
          <NoResult title="抱歉，暂无搜索结果" />
        </div>
      </Scroll>
    )
  }
}

const mapStateToProps = (state: IStoreState) => ({
  fullScreen: state.fullScreen,
  playlist: state.playlist,
  currentIndex: state.currentIndex,
  playing: state.playing,
  sequenceList: state.sequenceList
})

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any) => {
  return {
    ...ownProps,
    setSinger: (singer: ISinger) => {
      dispatch(setSinger(singer))
    },
    setPlaying: (playing: IPlaying) => {
      dispatch(setPlaying(playing))
    },
    setFullScreen: (fullScreen: IFullScreen) => {
      dispatch(setFullScreen(fullScreen));
    },
    setSequenceList: (sequenceList: ISequenceList) => {
      dispatch(setSequenceList(sequenceList));
    },
    setPlaylist: (list: IPlaylist) => {
      dispatch(setPlaylist(list));
    },
    setCurrentIndex: (index: ICurrentIndex) => {
      dispatch(setCurrentIndex(index));
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Suggest));