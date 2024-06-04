import React, { useEffect, useRef, useState } from 'react';
import './index.less'

const ResizeTable = (
	{
		columns=[], dataSource=[],
		onRightClick=()=>{},
		onAreaClick=()=>{}
	}
) => {
	const listenFlag = useRef(false)    // 标志位 确认只添加一次监听事件
	const canMove = useRef(false)
	const canData = useRef([])
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

	// 表格body点击事件 which 1:左键 3:右键
	const onBodyMouseDown = e => {
		if (e.nativeEvent.which && e.nativeEvent.which===3) {
			if (onAreaClick) onAreaClick(e.nativeEvent)
		}
	}

	// 表格行点击
	const onRowMouseDown = (e, index, item) => {
		console.log('get in onRowMouseDown');
		e.stopPropagation();
		if (e.nativeEvent.which && e.nativeEvent.which===3) {
			if (onRightClick) onRightClick(e.nativeEvent, item)
		}
	}

	// 表格行双击
	const onRowDoubleClick = () => {
		console.log('get in onRowDoubleClick');
	}


	return (
		<div className={'rt-wrap'}>
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
							<div key={'rt-tr'+index} className={'rt-tr'} onDoubleClick={e=>{onRowDoubleClick(e, index, item)}} onMouseDown={e=>{onRowMouseDown(e, index, item)}}>
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
						)
					})
				}
			</div>
		</div>
	);
};

export default ResizeTable;
