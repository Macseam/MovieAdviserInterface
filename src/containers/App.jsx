import React, { Component } from "react";
import ReactDOM from "react-dom";
import axios from 'axios';
import 'antd/dist/antd.css';
import _ from 'lodash';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import { Button, Col, Empty, Icon, message, Rate, Row, Slider, Spin, Tag } from "antd";
import './App.less'

const NODE_ENV = process.env.NODE_ENV || 'production';
const apiUrl = NODE_ENV === 'production' ? 'http://macseam.ru:8080' : 'http://localhost:3000';
const genresDictionary = {
    'Crime': 'Криминальный',
    'Thriller': 'Триллер',
    'Comedy': 'Комедия',
    'Drama': 'Драма',
    'History': 'Исторический',
    'Romance': 'Романтический',
    'Family': 'Семейный',
    'Horror': 'Ужасы',
    'Documentary': 'Документальный',
    'Adventure': 'Приключенческий',
    'Mystery': 'Мистика',
    'Short': 'Короткометражный',
    'Action': 'Экшен',
    'War': 'Военный',
    'Animation': 'Анимация',
    'Biography': 'Биография',
    'Music': 'Музыкальный',
    'Musical': 'Мюзикл',
    'Fantasy': 'Фэнтези',
    'Sci-Fi': 'Фантастика',
    'Reality-TV': 'Реалити-шоу',
    'Sport': 'Спортивный',
    'Western': 'Вестерн',
}
const genresParams = {
    'Comedy,Romance,Family': {title: 'Смешное', icon: 'comedy'},
    'Drama,Romance': {title: 'Грустное', icon: 'drama'},
    'Mystery,Horror': {title: 'Страшное', icon: 'horror'},
    'Thriller,Action,Adventure,Sci-Fi,Fantasy': {title: 'Бодрое', icon: 'action'},
    'Animation,Family': {title: 'Для детей', icon: 'for_kids'},
    'Documentary,History': {title: 'Документалки', icon: 'history'},
}
const yearsDictionary = {'old': 'Старое', 'new': 'Новое', 'all': 'Случайное'}
const ratingsDictionary = {'low': 'Малоизвестное', 'high': 'Популярное', 'all': 'Случайное'}

momentDurationFormatSetup(moment)

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            movies: [],
            loading: false,
            genre: _.noop(),
            rating: _.noop(),
            year: _.noop(),
        };
    }

    chooseQueryParam = e => {
        const gotName = _.get(e, 'target.name')
        const value = gotName ? gotName.split('-') : e.split('-')
        this.setState({
            [value[0]]: value[1]
        }, () => {
            if (value[0] === 'rating') {
                this.showAnother()
            }
        })
    }

    changeYear = value => {
        this.setState({
            year: value
        })
    }

    changeRating = value => {
        this.setState({
            rating: value
        }, () => {
            this.showAnother()
        })
    }

    showAnother = () => {
        const { genre, rating, year } = this.state;
        const that = this
        that.setState({
            movies: [],
            loading: true,
        });
        // const startTime = moment()
        axios.get(`${apiUrl}/random?genre=${genre}&year=${year}&rating=${rating}`)
            .then(function (response) {
                // const timeSpent = moment().diff(startTime)
                // message.info(`Время выполнения запроса: ${moment.utc(timeSpent).format('ss:SS')}`);
                that.setState({
                    movies: response.data,
                    loading: false,
                });
            })
            .catch(function (err) {
                const errorText = _.get(err, 'response.data.error', null)
                const errorStatus = _.get(err, 'response.status', null)
                let errorMsg = 'Неизвестная ошибка'
                if (errorText) {
                    errorMsg = errorText
                } else if (errorStatus) {
                    errorMsg = `Ошибка ${errorStatus}`
                } else if (err.request) {
                    errorMsg = 'Ошибка получения данных от сервера'
                }
                message.error(errorMsg);
                that.setState({
                    movies: [],
                    loading: false,
                });
            })
    }

    flagAsLoaded = id => {
        const { movies } = this.state
        const moviesMutated = movies
        const movieIndex = _.findIndex(movies, movieItem => movieItem.tconst === id)
        moviesMutated[movieIndex].loaded = true
        this.setState({
            movies: moviesMutated
        })
    }

    resetQuery = () => {
        this.setState({
            movies: [],
            loading: false,
            genre: _.noop(),
            rating: _.noop(),
            year: _.noop(),
        })
    }

    render() {
        const { movies, loading, genre, year, rating } = this.state;

        if (!genre) {
            return (
                <div className='main-div'>
                    <h2 className='main-title'>Какое кино интересует?</h2>
                    {/*_.map(genresParams, (dictItem, index) => (
                        <Button
                            key={index}
                            icon={dictItem.icon}
                            ghost
                            htmlType='button'
                            name={`genre-${index}`}
                            onClick={this.chooseQueryParam}
                            className='main-div__button'
                        >
                            {dictItem.title}
                        </Button>
                    ))*/}
                    {_.map(genresParams, (dictItem, index) => (
                        <div
                            key={index}
                            className='genre-icon-container'
                            onClick={() => this.chooseQueryParam(`genre-${index}`)}
                        >
                            <div className={`genre-icon icon-${dictItem.icon}`}>
                                &nbsp;
                            </div>
                            {dictItem.title}
                        </div>
                    ))}
                </div>
            )
        }

        if (genre && !year) {
            return (
                <div className='main-div'>
                    <h2 className='main-title'>Новое или старое?</h2>
                    {/*
                        <div className='main-div__slider'>
                            <Slider
                                marks={{
                                    1960: '1960',
                                    2019: '2019'
                                }}
                                min={1960}
                                max={2019}
                                defaultValue={2015}
                                onAfterChange={this.changeYear}
                            />
                        </div>
                    */}
                    {_.map(yearsDictionary, (dictItem, index) => (
                        <Button
                            key={index}
                            htmlType='button'
                            type={index === 'all' ? 'dashed' : 'default'}
                            ghost
                            name={`year-${index}`}
                            onClick={this.chooseQueryParam}
                            className='main-div__button'
                        >
                            {dictItem}
                        </Button>
                    ))}
                </div>
            )
        }

        if (year && !rating) {
            return (
                <div className='main-div'>
                    <h2 className='main-title'>Популярное или малоизвестное?</h2>
                    {/*
                        <div className='main-div__rating'>
                            <Rate
                                allowHalf
                                count={10}
                                defaultValue={2.5}
                                onChange={this.changeRating}
                            />
                        </div>
                    */}

                    {_.map(ratingsDictionary, (dictItem, index) => (
                        <Button
                            key={index}
                            htmlType='button'
                            type={index === 'all' ? 'dashed' : 'default'}
                            ghost
                            name={`rating-${index}`}
                            onClick={this.chooseQueryParam}
                            className='main-div__button'
                        >
                            {dictItem}
                        </Button>
                    ))}
                </div>
            )
        }

        return (
            <div className='main-div'>
                <h2 className='main-title'>
                    {loading
                        ? 'Поиск'
                        : _.capitalize(`Результат поиска (${genresParams[genre].title}, ${ratingsDictionary[rating]}, ${yearsDictionary[year]})`)
                    }
                </h2>
                <Row gutter={24} style={{ margin: '0 auto', width: '80%' }}>
                    {loading &&
                        <Col span={24}>
                            <div style={{
                                textAlign: 'center',
                                height: '200px',
                                paddingTop: '100px'
                            }}>
                                <Spin tip={
                                    <div>
                                        <div>Загрузка списка фильмов</div>
                                        <div>{_.capitalize(`(${genresParams[genre].title}, ${ratingsDictionary[rating]}, ${yearsDictionary[year]})`)}</div>
                                    </div>
                                } />
                            </div>
                        </Col>
                    }

                    {!loading && _.isEmpty(movies) &&
                    <Empty
                        description='Не удалось получить список фильмов'
                    >
                        <Button
                            htmlType="button"
                            onClick={() => this.resetQuery()}
                        >
                            Попробовать ещё раз
                        </Button>
                    </Empty>
                    }

                    {!_.isEmpty(movies) && _.map(movies, (movieItem, index) => {
                            const durationString = moment.duration(parseInt(movieItem.runtime_minutes, 10), "minutes")
                            const durationHours = durationString._data.hours
                            const durationMinutes = durationString._data.minutes
                            let ratingColor = '#795548'
                            if (movieItem.average_rating >= 5 && movieItem.average_rating < 8) {
                                ratingColor = '#607D8B'
                            } else if (movieItem.average_rating >= 8) {
                                ratingColor = '#FF9800'
                            }
                            return (
                                <Col
                                    key={movieItem.tconst || index}
                                    xs={{ span: 24 }}
                                    sm={{ span: 8 }}
                                    md={{ span: 8 }}
                                    lg={{ span: 8 }}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <div style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        backgroundColor: ratingColor
                                    }}>
                                        Рейтинг IMDB: {movieItem.average_rating}
                                    </div>
                                    <div className="test-wrapper">
                                        <div>
                                            <h3
                                                title={movieItem.title || movieItem.primary_title}
                                                style={{
                                                    marginBottom: '0',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {movieItem.title || movieItem.primary_title}
                                                </h3>
                                            {movieItem.title &&
                                            <h5
                                                title={movieItem.primary_title}
                                                style={{
                                                    fontSize: '11px',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {movieItem.primary_title}
                                            </h5>
                                            }
                                        </div>
                                        <div style={{
                                            width: '267px',
                                            height: '400px',
                                            verticalAlign: 'middle',
                                            textAlign: 'center',
                                            margin: '18px auto',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                zIndex: '100',
                                                top: '5px',
                                                left: '5px',
                                                fontSize: '10px',
                                                padding: '6px 10px',
                                                background: 'rgba(255,255,255,0.9)',
                                                borderRadius: '4px'
                                            }}>
                                                {movieItem.start_year}
                                            </div>
                                            {movieItem.runtime_minutes &&
                                            <div style={{
                                                position: 'absolute',
                                                zIndex: '100',
                                                top: '5px',
                                                right: '5px',
                                                fontSize: '10px',
                                                padding: '6px 10px',
                                                background: 'rgba(255,255,255,0.9)',
                                                borderRadius: '4px'
                                            }}>
                                                {durationHours ? `${durationHours} ч ` : ''}{durationMinutes ? `${durationMinutes} мин` : ''}
                                            </div>
                                            }
                                            {!movieItem.loaded &&
                                            <Icon
                                                type="loading"
                                                style={{
                                                    fontSize: '24px',
                                                    display: 'inline-block',
                                                    verticalAlign: 'middle',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)'
                                                }}
                                            />
                                            }
                                            <img
                                                src={`${apiUrl}/cover?movie_id=${movieItem.tconst}`}
                                                style={{
                                                    width: 'auto',
                                                    height: '100%',
                                                    display: movieItem.loaded ? 'block' : 'none',
                                                    position: 'absolute',
                                                    left: '-100%',
                                                    right: '-100%',
                                                    margin: '0 auto'
                                                }}
                                                onLoad={() => this.flagAsLoaded(movieItem.tconst)}
                                            />
                                        </div>
                                        <div>
                                            {
                                                _.map(movieItem.genres.split(','), (genreItem, indexGenre) => (
                                                    <Tag key={indexGenre} color="#8f8f8f">{genresDictionary[genreItem] || genreItem}</Tag>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </Col>
                            )
                        }
                    )}
                </Row>

                {!_.isEmpty(movies) &&
                    <div style={{ textAlign: 'center', width: '100%', marginTop: '10px' }}>
                        <Button
                            htmlType="button"
                            ghost
                            onClick={() => this.showAnother()}
                            className='main-div__button'
                        >
                            Обновить список
                        </Button>
                        <Button
                            htmlType="button"
                            ghost
                            onClick={() => this.resetQuery()}
                            className='main-div__button'
                        >
                            Начать сначала
                        </Button>
                    </div>
                }
            </div>
        );
    }
}
export default App;

ReactDOM.render(<App />, document.getElementById("root"))