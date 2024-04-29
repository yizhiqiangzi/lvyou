// 获取胶囊按钮数据
export const MenuButton = function() {
	const menuButton = wx.getStorageSync('MenuButton')
	const top = menuButton.top + 'px'
	const height = menuButton.height + 'px'
	const left = menuButton.left - 30 + 'px'
	const width = menuButton.width + 20 + 'px'
	const seViewHeight = menuButton.top + menuButton.height + 6 + 'px'
	return {
		top,
		height,
		left,
		width,
		seViewHeight
	}
}

