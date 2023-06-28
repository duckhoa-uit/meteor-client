import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import ws from "isomorphic-ws"
import SimpleDDP from "simpleddp"
import { simpleDDPLogin } from "simpleddp-plugin-login"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Icons } from "./icons"
import LoadingDots from "./loading-dots"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { useToast } from "./ui/use-toast"

type ServerConnectionProps = {}
export type ServerConnectionRef = {
  Meteor: SimpleDDP | null
}

const authenticationTypes = [
  { name: "none", description: "No auth" },
  { name: "username", description: "User" },
  { name: "email", description: "Email" },
]
const protocols = [
  { name: "ws", description: "WS Protocol" },
  { name: "wss", description: "WSS Protocol" },
]

type ConnectionState = "connecting" | "connected" | "disconnected" | "error"
const connectionLabels: Record<ConnectionState, string> = {
  connecting: "Connecting",
  connected: "Connected",
  disconnected: "Connect",
  error: "Error",
}

const ServerConnection = forwardRef<ServerConnectionRef, ServerConnectionProps>(
  ({}, ref) => {
    const [connectionState, setConnectionState] =
      useState<ConnectionState>("disconnected")
    const [openDisconnectDialog, setOpenDisconnectDialog] = useState(false)

    const { toast } = useToast()

    const meteorRef = useRef<SimpleDDP | null>(null)
    const meteorConnected = useMemo(
      () => connectionState === "connected",
      [connectionState]
    )

    type ProtocolType = "ws" | "wss"
    const [serverConnection, setServerConnection] = useState<{
      protocol: ProtocolType
      host: string
      port: string
      path: string
      reconnectInterval: number
      maxTimeout: number
    }>({
      protocol: "ws",
      host: "localhost",
      port: "3001",
      path: "websocket",
      reconnectInterval: 5000,
      maxTimeout: 7000,
    })

    type AuthType = "none" | "username" | "email"
    const [authentication, setAuthentication] = useState<{
      type: AuthType
      userOrEmail: string | null
      password: string | null
    }>({
      type: "none",
      userOrEmail: null,
      password: null,
    })

    const [showDialog, setShowDialog] = useState(false)
    const toggleDialog = () => setShowDialog(!showDialog)

    useImperativeHandle(ref, () => {
      return {
        Meteor: meteorRef.current,
      }
    })

    const initializeListeners = () => {
      if (meteorRef.current) {
        // Initialize listeners logic
        meteorRef.current.on("connected", async () => {
          console.info("Connected to the server")
          if (authentication.type !== "none") {
            let user = {}
            if (authentication.type === "username") {
              user = { username: authentication.userOrEmail }
            } else {
              user = { email: authentication.userOrEmail }
            }
            try {
              await meteorRef.current?.login({
                user,
                password: authentication.password,
              })
            } catch (error) {
              console.error("error authentication: ", error)
              meteorRef.current?.disconnect()
              // TODO: show alert
              // this.$alert.showAlertSimple("error", error.reason)
            }
          } else {
            console.warn("Connected without Authentication")
          }

          setConnectionState("connected")
        })

        meteorRef.current.on("disconnected", () => {
          meteorRef.current?.stopChangeListeners()

          setConnectionState("disconnected")
        })

        meteorRef.current.on("error", (e: any) => {
          // global errors from server
          console.error("Has occurred an error: ", e)
          setConnectionState("error")
        })

        meteorRef.current.on("login", (m: any) => {
          console.log("User logged in as: ", m)
        })

        meteorRef.current.on("logout", () => {
          console.log("User logged out")
        })

        meteorRef.current.on("loginSessionLost", (id: any) => {
          console.error(
            `User ${id} lost connection to server, will auto resume by default with token`
          )
        })

        meteorRef.current.on("loginResume", (m: any) => {
          console.log("User resumed (logged in by token)", m)
        })

        meteorRef.current.on("loginResumeFailed", (m: any) => {
          console.error(
            "Failed to resume authorization with token after reconnection ",
            m
          )
        })
      }
    }

    const validateConnection = () => {
      // Validate connection logic
      let isCorrect = true
      if (
        !serverConnection.protocol ||
        !serverConnection.host ||
        !serverConnection.path
      ) {
        toast({
          title: "Warning",
          description: "Please fill all data connection (host, etc)",
          variant: "destructive",
        })
        isCorrect = false
      }

      if (
        authentication.type !== "none" &&
        (!authentication.userOrEmail || !authentication.password)
      ) {
        toast({
          title: "Warning",
          description: "Please enter your credentials",
          variant: "destructive",
        })
        isCorrect = false
      }

      return isCorrect
    }

    const connect = () => {
      if (connectionState === "disconnected" || connectionState === "error") {
        // Connect logic
        if (validateConnection()) {
          setConnectionState("connecting")

          const opts = {
            endpoint: `${serverConnection.protocol}://${serverConnection.host}${
              serverConnection.port ? `:${serverConnection.port}` : ""
            }/${serverConnection.path}`,
            SocketConstructor: ws,
            reconnectInterval: serverConnection.reconnectInterval,
            maxTimeout: serverConnection.maxTimeout,
            autoConnect: false,
            autoReconnect: true, //TODO: Add to UI
          }
          meteorRef.current = new SimpleDDP(opts, [simpleDDPLogin])
          initializeListeners()
          meteorRef.current.connect()
        }
      } else {
        disconnectFromServer()
      }
    }

    const handleDisconnect = () => {
      disconnectFromServer()
      setOpenDisconnectDialog(false)
    }
    const disconnectFromServer = () => {
      // Disconnect from server logic
      meteorRef.current?.logout()
      meteorRef.current?.disconnect()
    }

    return (
      <div className="auth-wrapper flex">
        <Input
          value={serverConnection.host}
          onChange={(e) =>
            setServerConnection({ ...serverConnection, host: e.target.value })
          }
          placeholder="Host"
          disabled={meteorConnected}
        />
        <div className="">
          <Input
            type="number"
            value={serverConnection.port}
            onChange={(e) =>
              setServerConnection({
                ...serverConnection,
                port: e.target.value,
              })
            }
            placeholder="Port (leave empty if don't have)"
            disabled={meteorConnected}
            className="min-w-[250px]"
          />
        </div>
        <div className="">
          <Select
            onValueChange={(value) =>
              setAuthentication({
                ...authentication,
                type: value as AuthType,
              })
            }
            disabled={meteorConnected}
            defaultValue={authentication.type}
          >
            <SelectTrigger className="min-w-[100px]">
              <SelectValue placeholder="Port" />
            </SelectTrigger>
            <SelectContent>
              {authenticationTypes.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {authentication.type !== "none" && (
          <Input
            type="text"
            value={authentication.userOrEmail ?? ""}
            onChange={(e) =>
              setAuthentication({
                ...authentication,
                userOrEmail: e.target.value,
              })
            }
            placeholder="User/Email"
            disabled={meteorConnected}
          />
        )}
        {authentication.type !== "none" && (
          <Input
            type={"password"}
            value={authentication.password ?? ""}
            onChange={(e) =>
              setAuthentication({
                ...authentication,
                password: e.target.value,
              })
            }
            placeholder="Password"
            disabled={meteorConnected}
          />
        )}
        {connectionState === "connected" ? (
          <AlertDialog
            open={openDisconnectDialog}
            onOpenChange={setOpenDisconnectDialog}
          >
            <AlertDialogTrigger asChild>
              <Button className="ml-2">
                <Icons.check className="mr-2 h-5 w-5" />
                {connectionLabels["connected"]}{" "}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will disconnect from server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect}>
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={connect}
            disabled={connectionState === "connecting"}
            className="ml-2"
          >
            {connectionState === "connecting" && <LoadingDots />}
            {connectionLabels[connectionState]}
          </Button>
        )}

        <Dialog open={showDialog} onOpenChange={toggleDialog}>
          <DialogTrigger asChild>
            <Button variant={"outline"} className="ml-2 h-10">
              <Icons.settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced options</DialogTitle>
            </DialogHeader>

            <form className="flex flex-col">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Protocol</Label>
                <Select
                  onValueChange={(value) =>
                    setServerConnection({
                      ...serverConnection,
                      protocol: value as ProtocolType,
                    })
                  }
                  defaultValue={serverConnection.protocol}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Port" />
                  </SelectTrigger>
                  <SelectContent>
                    {protocols.map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-3 grid w-full items-center gap-1.5">
                <Label htmlFor="email">Path</Label>
                <Input
                  value={serverConnection.path}
                  onChange={(e) =>
                    setServerConnection({
                      ...serverConnection,
                      path: e.target.value,
                    })
                  }
                  placeholder="Path"
                  disabled={meteorConnected}
                />
              </div>
              <div className="mt-3 grid w-full items-center gap-1.5">
                <Label htmlFor="email">Reconnect interval</Label>
                <Input
                  value={serverConnection.reconnectInterval}
                  onChange={(e) =>
                    setServerConnection({
                      ...serverConnection,
                      reconnectInterval: e.target.valueAsNumber,
                    })
                  }
                  placeholder="Reconnect interval"
                  disabled={meteorConnected}
                />
              </div>
              <div className="mt-3 grid w-full items-center gap-1.5">
                <Label htmlFor="email">Max Timeout</Label>
                <Input
                  value={serverConnection.maxTimeout}
                  onChange={(e) =>
                    setServerConnection({
                      ...serverConnection,
                      maxTimeout: e.target.valueAsNumber,
                    })
                  }
                  placeholder="Max Timeout"
                  disabled={meteorConnected}
                />
              </div>
            </form>
            <DialogFooter>
              <Button className="mt-3" onClick={toggleDialog}>
                Update Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

export default ServerConnection
