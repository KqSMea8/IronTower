import React, { Fragment } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Input,
  Button,
  Breadcrumb,
  Form
} from 'antd';
import EditAlarm from './editAlarm/editAlarm';
import IntializeModal from './initializeDevice/initializeDevice'
import store from './store';
import { observer } from "mobx-react";
import style from './monitor.css';
import { Link } from 'react-router-dom';
import request from '../../helpers/request';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';

const Search = Input.Search;

const now = new Date();
now.setDate(1);
var startTime = moment(now).format('YYYY-MM-DD');
now.setMonth(now.getMonth() + 1);
now.setDate(now.getDate() - 1);
var endTime = moment(now).format('YYYY-MM-DD');

const state_type = ['', '正常', '停用'];
const ini_state = ['', '成功', '待处理'];



@observer
class Monitor extends React.Component {
  constructor(props) {
    super(props);
  }
  data = [{
    "params": {
      "angleX": 200
    }
  }]
  columns = [
    {
      title: 'ID',
      dataIndex: 'Tower_id',
    },
    {
      title: 'IMEI',
      dataIndex: 'imei',
      render: (text, record, index) => {
        return <a onClick={(e) => { e.preventDefault; this.getDataList(text) }}>{text}</a>
      }
    },
    {
      title: '设备名称',
      dataIndex: 'title',
    },
  ];
  workColumns = [
    {
      title: 'IMEI',
      dataIndex: 'imei',
      width: 120,
    },
    {
      title: '倾角',
      dataIndex: 'angle',
      width: 90,
    },
    {
      title: 'x轴倾角',
      dataIndex: 'angle_x',
      width: 90

    },
    {
      title: 'y轴倾角',
      dataIndex: 'angle_y',
      width: 90

    },
    {
      title: '状态',
      dataIndex: 'deviceState',
      width: 90

    },
    {
      title: '日期',
      dataIndex: 'create_time',
      width: 150
    },
  ];

  componentDidMount() {
    this.getDevicesList();
  }
  calAngle = (x, y) => {
    let cosX = Math.cos(x / 180);
    let cosY = Math.cos(y / 180);
    let sinX = Math.sin(x / 180);
    let sinY = Math.sin(y / 180);
    let num_1 = Math.pow(cosX, 2) - Math.pow(sinY, 2);
    let num_2 = Math.pow(cosY, 2) - Math.pow(sinX, 2);
    let sqrt_1 = Math.sqrt(num_1);
    let sqrt_2 = Math.sqrt(num_2);
    let angle;
    if (num_1 > 0) {
      angle = Math.acos(sqrt_1) * Math.PI;
      angle = angle.toFixed(5);
      return angle
    } else {
      angle = Math.acos(sqrt_2) * Math.PI;
      angle = angle.toFixed(5);
      return angle
    }
  }
  render() {
    let { alarm_modal, initialize_modal, realtimeData, basicMsg, initialParams, months_data, fetchList, initialData } = store;
    let { imei, title, Tower_id, X0, Y0, X1, Y1, create_time, angle, state, update_time } = basicMsg;
    let { x, y } = realtimeData;
    angle = parseFloat(angle).toFixed(3);
    return (
      <Fragment>
        <Breadcrumb>
          <Breadcrumb.Item>监控页</Breadcrumb.Item>
        </Breadcrumb>
        <Row gutter={8} >
          <Col span={5} style={{ height: 800, zIndex: 5 }}>
            <Card title='工作铁塔' style={{ height: "100%" }}>
              <Search onSearch={value => console.log(value)} enterButton style={{ marginBottom: 5 }} />
              <Table dataSource={fetchList} columns={this.columns} rowKey={record => record.id} size='small' />
            </Card>
          </Col>
          <Col>
            <Row gutter={8}>
              <Col span={5} style={{ height: 450 }}>
                <Card title='基本信息' style={{ height: "100%" }} extra={<Button size='small' onClick={() => initialize_modal.visible = true}>初始化</Button>}>
                  <h4>IMEI: <span className={style.basicMessage}>{imei}</span></h4>
                  <h4>名称: <span className={style.basicMessage}>{title}</span></h4>
                  <h4>创建时间: <span className={style.basicMessage}>{create_time}</span></h4>
                  <h4>警报功能设置
                    <Button size='small' type='primary' style={{ float: 'right' }} onClick={() => {
                      alarm_modal.visible = true
                    }}>编辑</Button>
                  </h4>
                  <h4 style={{ margin: '0 auto', fontSize: 16, whiteSpace: 'pre' }}>
                    <br />X轴初始角度:  {X0}°
                    <br />Y轴初始角度:  {Y0}°
                    <br />X轴报警指数:  {X1}°
                    <br />Y轴报警指数:  {Y1}°
                    <br />初始倾斜角度:  {angle}°
                    <br />初始化时间:  {update_time}
                    <br />初始化结果:  {ini_state[state]}
                  </h4>
                </Card>
              </Col>
              <Col span={13} style={{ marginBottom: 12 }} style={{ height: 180, marginBottom: 10 }}>
                <Card title='实时工作状态' style={{ height: "100%" }}
                  extra={<div>最近一次更新：{realtimeData.create_time}</div>}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}><span>倾角</span></div>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}><span>x轴倾角</span></div>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}><span>y轴倾角</span></div>
                  </div>
                  <div style={{ display: 'flex', marginTop: 10 }}>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: 28, color: 'green' }}><span>{realtimeData.angle}°</span></div>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: 28, color: 'green' }}><span>{x}°</span></div>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: 28, color: 'green' }}><span>{y}°</span></div>
                  </div>
                </Card>
              </Col>
              <Col span={13} style={{ height: 260 }}>
                {/* extra={<Link to='/historyStatus'>历史工作情况</Link>} */}
                <Card title='本月工作情况' style={{ height: "100%" }}>
                  <Table columns={this.workColumns} dataSource={months_data} size={"small"} pagination={false} scroll={{ y: 120 }} rowKey={record => record.create_time} />
                </Card>
              </Col>
              <Col span={18} style={{ marginTop: 10, height: 340 }}>
                <Card style={{ height: '100%' }} bordered={false} bodyStyle={{ padding: '0 0 32px 0' }}>
                  <ReactEcharts option={this.getOption()} style={{ width: '100%' }} notMerge={true} lazyUpdate={true} ></ReactEcharts>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
        <EditAlarm props={alarm_modal} params={basicMsg} initialDatas={initialData} />
        <IntializeModal props={initialize_modal} params={basicMsg} date={initialParams} />
      </Fragment>
    )
  }
  getDevicesList = () => {
    request({
      url: 'api/show_sensor_list',
      success: ({ data }) => {
        store.fetchList = data;
        let imei = data[0].imei
        this.getDataList(imei);
      }
    })
  }
  getDeviceData = (imei) => {
    request({
      url: 'api/show_adjust_angle',
      data: {
        imei
      },
      success: ({ data }) => {
        store.basicMsg = data[0];
        this.getCurrentData(imei);
      }
    })
  }
  getDataList = (imei) => {
    request({
      url: 'api/show_data_list',
      data: {
        imei,
        startTime,
        endTime,
        page: 1,
        size: 31
      },
      success: ({ data }) => {
        store.months_data = data;
        this.getDeviceData(imei);
        this.getAngle(imei);
      }
    })
  }
  getCurrentData = (imei) => {
    request({
      url: 'api/Lately_data',
      data: {
        imei
      },
      success: ({ data }) => {
        store.realtimeData = data[0];
      }
    })
  }
  getAngle = (imei) => {
    request({
      url: 'api/show_angle',
      data: {
        imei,
      },
      success: ({ data }) => {
        let angleValue = data.map(v => v.angle);
        let dateValue = data.map(v => v.create_time);
        let xValue = data.map(v => v.angle_x);
        let yValue = data.map(v => v.angle_y);
        store.dateValue = dateValue;
        store.angleValue = angleValue;
        store.xValue = xValue;
        store.yValue = yValue;
      }
    })
  }
  getOption = () => {
    return {
      title: [{
        left: '3%',
        text: '倾角变化图'
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis'
      },
      legend:{
        data:['总倾角','x轴倾角','y轴倾角']
      },
      xAxis: [{
        type: 'category',
        data: store.dateValue
      }],
      yAxis: [{
        splitLine: { show: false }
      }],
      dataZoom: [{
        show: true,
        start: 60,
        end: 95,
        realtime: true
      }, {
        type: 'slider'
      }],
      series: [
        {
          name:'总倾角',
          type: 'line',
          showSymbol: true,
          data: store.angleValue
        },
        {
          name:'x轴倾角',
          type: 'line',
          showSymbol: true,
          data: store.xValue
        },
        {
          name:'y轴倾角',
          type: 'line',
          showSymbol: true,
          data: store.yValue
        }
      ]
    }
  }
}


export default Form.create()(Monitor)