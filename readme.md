Structure \
project: React -> middleware -> backend \
port: 3000(frontend) 6379(redis) 8080(backend) \

1. Add a .env file in backend folder with the following

```
   {
   CONNECTIONSTRING= <your_mongoDB_Atlas_uri_with_credentials>
   PORT=8080
   JWTSECRET=<your_secret_token>
   }
```

2. Install all dependencies in 2 frontend folder and backend folder

```
   npm install
```

3. Run front end

```
   npm run dev
```

4. Run back end

```
   npm start
```

5. Create a EKS in AWS(under create-EKS file)

```
terraform init
terraform plan
terraform apply
```

6. Config the kubectl

```
   aws eks --region $(terraform output region) update-kubeconfig --name $(terraform output cluster_name)
```

7. create moniter using metrics server

```
wget -O v0.3.6.tar.gz https://codeload.github.com/kubernetes-sigs/metrics-server/tar.gz/v0.3.6 && tar -xzf v0.3.6.tar.gz
kubectl apply -f metrics-server-0.3.6/deploy/1.8+/ kubectl get deployment metrics-server -n kube-system
Kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/recom mended.yaml
kubectl proxy
kubectl apply -f https://raw.githubusercontent.com/hashicorp/learn-terraform-provision-eks-cluster/maste r/kubernetes-dashboard-admin.rbac.yaml
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep service-controller-token | awk '{print $1}'))
```

8. Do the final deployment(under manually deploy-yaml file)

```
chmod +x exec.sh
Run ./exec.sh

```

Besides, remember to change the url in the front end Main.js in around 7th line
and DevOpsFinalProject/frontend/app/components/Chat.js around 33th line

