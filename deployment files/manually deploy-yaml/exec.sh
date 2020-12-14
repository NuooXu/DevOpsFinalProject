kubectl delete deployment --all
kubectl delete service --all

kubectl apply -f front-svc.yaml
kubectl apply -f redis.yaml
kubectl apply -f back-svc.yaml