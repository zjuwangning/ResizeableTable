import React, { useEffect, useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons'
import './index.less'


const ResizeTable = (
	{
		loading=false,
		columns=[], dataSource=[],
		selectedRowKeys = [],
		maskedRowKeys = [],
		rowKey = '',
		onRow = () => {},
		onArea = () => {}
	}
) => {
	const canMove = useRef(false)
	const currentIndex = useRef(-1)     // 当前正在操作的resize line
	const moveX = useRef(0)             // 鼠标一次点击 X轴移动的距离
	const tCols = useRef([])        // 表格表头
	const [list, setList] = useState([])
	const [tableColumns, setColumns] = useState([])


	// TODO 限制表头resize时鼠标移动的距离
	useEffect(() => {
		window.addEventListener('mouseup', onMouseup)
		window.addEventListener('mousemove', onMousemove)

		return () => {
			window.removeEventListener('mouseup', onMouseup)
			window.removeEventListener('mousemove', onMousemove)
		}
	}, [])

	// 传入columns
	useEffect(() => {
		setColumns(columns)
		tCols.current = columns

		return () => {}
	}, [columns])

	// 传入dataSource
	useEffect(() => {
		setList(dataSource)

		return () => {}
	}, [dataSource])

	// 鼠标抬起事件
	const onMouseup = e => {
		let reLiEle = document.getElementById('tr-r-l-i')
		reLiEle.style.display = 'none'

		if (canMove.current) {
			canMove.current = false
			let cols = [];
			for (let k in tCols.current) {
				cols.push(tCols.current[k])
				if (Number(k) === currentIndex.current) {
					cols[k]['width'] = cols[k]['width'] + moveX.current
				}
			}
			tCols.current = cols
			setColumns(cols)
		}
	}

	// 鼠标移动事件
	const onMousemove = e => {
		if (canMove.current) {
			let reLiEle = document.getElementById('tr-r-l-i')
			let left = Number(reLiEle.style.left.slice(0,-2))
			left = left + e.movementX
			moveX.current = moveX.current+e.movementX;
			reLiEle.style.left = left+'px'
		}
	}

	// 表头resize线点击
	const onLineClick = (index, col) => {
		let left = 0;
		for (let k=0; k<=index; k++) {
			left += col[k]['width']
		}
		let reLiEle = document.getElementById('tr-r-l-i')
		reLiEle.style.left = left+'px'
		reLiEle.style.display = ''
		canMove.current = true
		currentIndex.current = Number(index)
		moveX.current = 0
	}

	// 表格行外区域点击 MouseDown 区分左键 右键
	const onBodyMouseDown = e => {
		e.stopPropagation();
		if (e.nativeEvent) {
			if (e.nativeEvent.which===3) onArea().onContextMenu(e)
			else if (e.nativeEvent.which===1) onArea().onClick(e)
		}
	}

	// 表格行单击 MouseDown 区分左键 右键
	const onRowMouseDown = (e, index, item) => {
		e.stopPropagation();
		if (e.nativeEvent) {
			if (e.nativeEvent.which===3) onRow(item).onContextMenu(e)
			else if (e.nativeEvent.which===1) onRow(item).onClick(e)
		}
	}

	// 表格行双击
	const onRowDoubleClick = (e, index, item) => {
		onRow(item).onDoubleClick(e)
	}

	// 获取表格行类名 分为选中/剪切 两种状态
	const getClassName = (key) => {
		let temp = 'rt-tr'
		if (selectedRowKeys.includes(key)) temp+=' rt-tr-s'
		if (maskedRowKeys.includes(key)) temp+=' rt-tr-m'
		return temp
	}

	return (
		<div className={'rt-wrap'}>
			<div className={'rt-loading-wrap'} style={{display: loading?'flex':'none'}}>
				<LoadingOutlined style={{fontSize: '28px'}}/>
			</div>
			<div id={'tr-r-l-i'} className={'tr-r-l'} style={{display: 'none'}}>
				<div className={'resize-line-color-area'}/>
			</div>
			<div className={'rt-header'}>
				{
					tableColumns.map((item, index)=>{
						return (
							<div key={'rt-th'+index} className={index===0?'rt-th':'rt-th rt-th-bo'} style={{width: item['width']}}>
								{item['title']}
								{
									index===tableColumns.length-1?'':(
										<div id={'th-r-l'+index} className={'th-r-l'} onMouseDown={()=>{onLineClick(index, tCols.current)}}/>
									)
								}
							</div>
						)
					})
				}
			</div>
			<div id={'rt-b-i'} className={'rt-body'} onMouseDown={onBodyMouseDown}>
				{
					list.map((item, index) => {
						return (
							<div
								key={'rt-tr'+index}
								className={getClassName(item[rowKey])}
								onDoubleClick={e=>{onRowDoubleClick(e, index, item)}}
								onMouseDown={e=>{onRowMouseDown(e, index, item)}}
							>
								<div className={'rt-tr-wrap'}>
									{
										tableColumns.map((column, ci)=>{
											return (
												<div style={{width: column['width']}} className={ci===0?'rt-td-wrap':'rt-td-wrap rt-td-bo'}>
													<div key={'rt-td'+ci} className={'rt-td'} >
														{column['render']?column['render'](item[column['dataIndex']], item):item[column['dataIndex']]}
													</div>
												</div>
											)
										})
									}
								</div>
							</div>
						)
					})
				}
			</div>
		</div>
	);
};

export default ResizeTable;
