import { ITheme } from 'xterm'
type asdf = {
    [Property in keyof ITheme]:string
}
