provider "kubernetes" {}

resource "kubernetes_deployment" "final-back" {
  metadata {
    name = "final-back"
    labels = {
      test = "final-back"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        test = "final-back"
      }
    }

    template {
      metadata {
        labels = {
          test = "final-back"
        }
      }

      spec {
        container {
          image = "merphylau/final-be"
          name  = "final-back"

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

resource "kubernetes_service" "final-back-svc" {
  metadata {
    name = "final-back-svc"
  }
  spec {
    selector = {
      app = "${kubernetes_deployment.final-back.metadata.name}"
    }
    session_affinity = "ClientIP"
    port {
      port        = 8080
      target_port = 8080
    }
    type = "ClusterIP"
  }
}
