# react-router - 在離開 route 前確認

## 需求：

1. 編輯未儲存前，離開開該 route 須請 user 確認
2. 需要自訂的 confirm dialog

根據官方 2.x 的[文件](https://github.com/ReactTraining/react-router/blob/v2.8.1/docs/guides/ConfirmingNavigation.md)


## 使用 `@withRouter` 取得 `router` 及 `route`

```
@provideHooks(...)
@connect(...)
@withRouter
export default class PostListPage extends React.PureComponent {
  static propTypes = {
    route: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };
}
```

## 使用 `router.setRouteLeaveHook()` 監聽

```
  componentDidMount() {
    const {route, router} = this.props;

    router.setRouteLeaveHook(route, this.routerWillLeave);
  }

  routerWillLeave = (nextLocation) => {
    const {app: {isLogin}, pushPath} = this.props;

    if (isLogin && !get(nextLocation, ['state', 'confirmed']) && this.isSubscriptionFormDirty()) {
      return '尚未儲存，確定要離開嗎？';
    }
    return true;
  };
```

## 但是，我們要的自訂確認畫面呢？

```js
  routerWillLeave = (nextLocation) => {
    const {app: {isLogin}, pushPath} = this.props;

    if (isLogin && !get(nextLocation, ['state', 'confirmed']) && this.isSubscriptionFormDirty()) {
      this.confirm(() => {
        pushPath({
          ...nextLocation,
          state: {
            confirmed: true
          }
        });
      });
      return false;
    }
    return true;
  };

  confirm(onOkClick) {
    const {pushModal, popModal} = this.props;

    pushModal({
      element: (
        <PostSubscriptionConfirm onOkClick={handleOkClick} onCancelClick={handleCancelClick}/>
      ),
      isTransparent: true
    });

    function handleOkClick() {
      popModal();
      onOkClick();
    }

    function handleCancelClick() {
      popModal();
    }
  }
```

## 但是，這樣就不會動了

```js
  componentWillReceiveProps(nextProps) {
    const {route, router, posts, listPost} = nextProps;

    if (route !== this.props.route) {
      if (this.unsetRouteLeaveHook) {
        this.unsetRouteLeaveHook();
      }
      this.unsetRouteLeaveHook = router.setRouteLeaveHook(route, this.routerWillLeave);
    }
  }

  componentDidMount() {
    const {route, router} = this.props;

    this.unsetRouteLeaveHook = router.setRouteLeaveHook(route, this.routerWillLeave);
  }

  componentWillUnmount() {
    if (this.unsetRouteLeaveHook) {
      this.unsetRouteLeaveHook();
      this.unsetRouteLeaveHook = null;
    }
  }

```
