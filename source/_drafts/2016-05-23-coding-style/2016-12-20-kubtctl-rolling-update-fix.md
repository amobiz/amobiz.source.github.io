# Kubtctl


### 安裝 gcloud

https://cloud.google.com/sdk/

參考：

[V2 deployment guide](https://dcard.quip.com/9ogKAIcPyIlw)

### 安裝 kubectl

`gcloud components install kubectl`

### 找出名稱特別長的 

```bash
kubectl get rc
```
dcard-web-dskfodihvdslknfsdf	49  29 0d

### 砍掉它

```bash
kubectl delete rc/dcard-web-dskfodihvdslknfsdf
```

### 如果還是不行，要先 scale down，然後 rebuild:

```bash
kubectl scale  --replicas=20 rc/dcard-web
```

## 參考資料

* [Kubernetesのポッドが起動しない原因と対策](http://qiita.com/minodisk/items/547741b73763f2bab6b8)
* [Simple rolling update](https://github.com/kubernetes/kubernetes/blob/master/docs/design/simple-rolling-update.md#aborting-a-rollout)
* [Rolling Updates Guides](http://kubernetes.io/docs/user-guide/rolling-updates/)
* [kubectl rolling-update](http://kubernetes.io/docs/user-guide/kubectl/kubectl_rolling-update/)
* [Rolling Update Demo](http://kubernetes.io/docs/user-guide/update-demo/)