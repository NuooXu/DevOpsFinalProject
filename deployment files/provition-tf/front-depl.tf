provider "kubernetes" {}

resource "kubernetes_deployment" "final-front" {
  metadata {
    name = "final-front"
    labels = {
      test = "final-front"
    }
  }

  spec {
    replicas = 3

    selector {
      match_labels = {
        test = "final-front"
      }
    }

    template {
      metadata {
        labels = {
          test = "final-front"
        }
      }

      spec {
        container {
          image = "merphylau/final-fe"
          name  = "final-front"

          resources {
            limits {
              cpu    = "0.5"
              memory = "512Mi"
            }
            requests {
              cpu    = "250m"
              memory = "50Mi"
            }
          }


        }
      }
    }
  }
}

resource "kubernetes_service" "final-front-svc" {
  metadata {
    name = "final-front-svc"
  }
  spec {
    selector = {
      app = "${kubernetes_deployment.final-front.metadata.name}"
    }
    session_affinity = "ClientIP"
    port {
      port        = 80
      target_port = 80
    }

    type = "LoadBalancer"
  }
}
