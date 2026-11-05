 ### Step 2: Extracting the User in Any Handler
  
  In any HTTP handler (for example, in                                
  handlers/application/handler.go/TrueHook/backend/api/internal/handle
  rs/application/handler.go)), call
  GetUserID/TrueHook/backend/api/internal/server/middleware.go):      
                                                                      
    package application
  
    import (                                                          
        "net/http"
  
        "github.com/ShivamIT23/TrueHook/backend/api/internal/server"
        "github.com/ShivamIT23/TrueHook/backend/packages/common/respon
        se"
    )                                                                 
                                                                      
    func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
        // Extract the authenticated User ID from context
        userID, ok := server.GetUserID(r.Context())
        if !ok {                                                         
            response.Fail(w, http.StatusUnauthorized, "User not              
            authenticated", nil, "UNAUTHORIZED")                             
            return                                                           
        }
  
        // You now have the verified UUID to associate records or
        check ownership
        _ = userID 
  
        // ... rest of handler logic
    }
  ──────
  ### Step 3: Protecting Routes in the Router 
  
  In your router registration (e.g.                                   
  endpoints/application/routes.go/TrueHook/backend/api/internal/endpoi
  nts/application/routes.go)), wrap the protected endpoints using     
  RequireAuth:
  
    package application
  
    import (
        "net/http"
  
        "github.com/ShivamIT23/TrueHook/backend/api/internal/server"
    )
  
    // RegisterRoutes registers application endpoints, protecting them
    with RequireAuth. 
    func RegisterRoutes(mux *http.ServeMux, handler *Handler,         
    jwtSecret string) {
        auth := server.RequireAuth(jwtSecret)                            
  
        // Wrap handlers that require authentication with auth(...)
        mux.Handle("POST /api/v1/applications",
        auth(http.HandlerFunc(handler.Create)))
        mux.Handle("GET /api/v1/applications",
        auth(http.HandlerFunc(handler.List)))
        mux.Handle("GET /api/v1/applications/{id}",
        auth(http.HandlerFunc(handler.GetByID)))
    }
  ──────
  ### Step 4: Wire JWT_SECRET in RouterConfig 
                                                                      
  In                                                                  
  backend/api/internal/server/routes.go/TrueHook/backend/api/internal/
  server/routes.go):
  
    type RouterConfig struct {
        AuthHandler *authHandler.Handler
        JWTSecret   string
        // ApplicationHandler *applicationHandler.Handler
    }
  
    func NewRouter(cfg RouterConfig) *http.ServeMux {                 
        mux := http.NewServeMux()
  
        // Public routes (Signup / Signin)
        if cfg.AuthHandler != nil {                                      
            authRoutes.RegisterRoutes(mux, cfg.AuthHandler)                  
        }                                                                
                                                                      
        // Protected routes pass cfg.JWTSecret:                          
        // if cfg.ApplicationHandler != nil {                            
        //     applicationRoutes.RegisterRoutes(mux,                         
        cfg.ApplicationHandler, cfg.JWTSecret)                           
        // }                                                             
                                                                      
        return mux                                                       
    }                                                                 
                                                                      
  And pass cfg.JWT_SECRET from                                        
  backend/api/cmd/api/main.go/TrueHook/backend/api/cmd/api/main.go#L58
  -L62):
  
    router := server.NewRouter(server.RouterConfig{
        AuthHandler: authHandler,
        JWTSecret:   cfg.JWT_SECRET,
    })