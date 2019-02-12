import React, { Component } from "react";
import ReactDOM from "react-dom";
import axios from 'axios';
import 'antd/dist/antd.css';
import _ from 'lodash';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import { Button, Card, Col, Icon, message, Rate, Row, Spin, Tag } from "antd";

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

momentDurationFormatSetup(moment)

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            movies: []
        };
    }

    componentWillMount() {
        this.showAnother()
    }

    showAnother() {
        const that = this
        that.setState({
            movies: []
        });
        const startTime = moment()
        axios.get(`${apiUrl}/random`)
            .then(function (response) {
                const timeSpent = moment().diff(startTime)
                message.info(`Время выполнения запроса: ${moment.utc(timeSpent).format('ss:SS')}`);
                that.setState({
                    movies: response.data
                });
            })
            .catch(function () {
                that.setState({
                    movies: []
                });
            })
    }

    flagAsLoaded(id) {
        const { movies } = this.state
        const moviesMutated = movies
        const movieIndex = _.findIndex(movies, movieItem => movieItem.tconst === id)
        moviesMutated[movieIndex].loaded = true
        this.setState({
            movies: moviesMutated
        })
    }

    render() {
        const { movies } = this.state;

        return (
            <div style={{ marginTop: '30px' }}>
                <Row>
                    {_.isEmpty(movies) &&
                        <Col span={24}>
                            <div style={{
                                textAlign: 'center',
                                height: '200px',
                                paddingTop: '100px'
                            }}>
                                <Spin tip="Загружаем" />
                            </div>
                        </Col>
                    }
                    {!_.isEmpty(movies) && _.map(movies, (movieItem, index) => (
                        <Col key={movieItem.tconst} span={5} offset={index === 0 ? 3 : 1}>
                            <Card
                                title={<div>
                                    <h3>{movieItem.primary_title}</h3>
                                    <h5>{movieItem.title}</h5>
                                </div>}
                            >
                                <h5>Год выхода: {movieItem.start_year}</h5>
                                <h5>Хронометраж: {moment.duration(parseInt(movieItem.runtime_minutes, 10), "minutes").format("h:mm")}</h5>
                                <Rate
                                    style={{ margin: '10px 0' }}
                                    disabled
                                    defaultValue={movieItem.average_rating
                                        ? parseInt(movieItem.average_rating / 2, 10)
                                        : movieItem.average_rating}
                                    allowHalf
                                /> {movieItem.average_rating}
                                <div style={{
                                    width: '100%',
                                    height: !movieItem.loaded ? '400px' : _.noop(),
                                    background: !movieItem.loaded ? '#e8e8e8' : _.noop(),
                                    paddingTop: !movieItem.loaded ? '180px' : _.noop(),
                                    textAlign: 'center',
                                    marginBottom: '8px',
                                }}>
                                    {!movieItem.loaded &&
                                        <Icon
                                            type="loading"
                                            style={{
                                                fontSize: '24px',
                                                display: 'inline-block',
                                                verticalAlign: 'middle'
                                            }}
                                        />
                                    }
                                    <img
                                        src={`${apiUrl}/cover?movie_id=${movieItem.tconst}`}
                                        style={{ maxWidth: '100%', display: movieItem.loaded ? 'block' : 'none'}}
                                        onLoad={() => this.flagAsLoaded(movieItem.tconst)}
                                    />
                                </div>
                                {!_.isEmpty(movieItem.genres) && _.map(movieItem.genres.split(','), (genreItem, indexGenre) => (
                                    <Tag key={indexGenre}>{genresDictionary[genreItem] || genreItem}</Tag>
                                ))
                                }
                            </Card>
                        </Col>
                    ))}
                </Row>
                {!_.isEmpty(movies) &&
                    <div style={{ textAlign: 'center', width: '100%', marginTop: '30px' }}>
                        <Button
                            htmlType="button"
                            onClick={() => this.showAnother()}
                        >
                            Ещё 3 фильма
                        </Button>
                    </div>
                }
            </div>
        );
    }
}
export default App;

ReactDOM.render(<App />, document.getElementById("root"))