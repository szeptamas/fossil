return {
    node_name: '',
    manifest: {
        timers: ['demo_tick']
    },
    persist: {
        version: 1,
        data: ['selected_option']
    },
    config: {},
    selected_option: 0,
    options: [
        'First item',
        'Second item',
        'Third item'
    ],

    handler: function (event, response) {
        this.wrap_event(event)
        this.wrap_response(response)
        this.state_machine.handle_event(event, response)
    },

    wrap_event: function (event) {
        if (event.type === 'system_state_update') {
            event.concerns_this_app = event.de
            event.old_state = event.ze
            event.new_state = event.le
        }
        return event
    },

    wrap_response: function (response) {
        response.move_hands = function (hour, minute, relative) {
            response.move = {
                h: hour,
                m: minute,
                is_relative: relative
            }
        }

        response.go_back = function (kill_app) {
            response.action = {
                type: 'go_back',
                Se: kill_app
            }
        }

        response.draw_screen = function (node_name, full_update, layout_info) {
            response.draw = {
                update_type: full_update ? 'du4' : 'gu4'
            }
            response.draw[node_name] = {
                layout_function: 'layout_parser_json',
                layout_info: layout_info
            }
        }

        return response
    },

    draw: function (response) {
        response.draw_screen(
            this.node_name,
            true,
            {
                json_file: 'menu_layout',
                header: 'PC Simulator',
                options: this.options,
                selected_option: this.selected_option,
                is_header_selected: false
            }
        )
    },

    handle_global_event: function (self, state_machine, event, response) {
        if (
            event.type === 'system_state_update'
            && event.concerns_this_app === true
            && event.new_state === 'visible'
        ) {
            state_machine.set_current_state('menu')
        } else if (event.type === 'middle_hold') {
            response.go_back(true)
        }
    },

    handle_state_specific_event: function (state, phase) {
        if (state === 'menu' && phase === 'entry') {
            return function (self, response) {
                response.move_hands(270, 90, false)
                self.draw(response)
            }
        }

        if (state === 'menu' && phase === 'during') {
            return function (self, state_machine, event, response) {
                if (event.type === 'top_short_press_release') {
                    self.selected_option = Math.max(0, self.selected_option - 1)
                    save_node_persist(self.node_name)
                    self.draw(response)
                } else if (event.type === 'bottom_short_press_release') {
                    self.selected_option = Math.min(
                        self.options.length - 1,
                        self.selected_option + 1
                    )
                    save_node_persist(self.node_name)
                    self.draw(response)
                } else if (event.type === 'middle_short_press_release') {
                    self.options[self.selected_option] =
                        'Selected ' + (self.selected_option + 1)
                    self.draw(response)
                }
            }
        }

        return undefined
    },

    wrap_state_machine: function (state_machine) {
        state_machine.set_current_state = state_machine.d
        state_machine.handle_event = state_machine._
        state_machine.get_current_state = function () {
            return state_machine.n
        }
        return state_machine
    },

    init: function () {
        this.state_machine = new state_machine(
            this,
            this.handle_global_event,
            this.handle_state_specific_event,
            undefined,
            'background'
        )
        this.wrap_state_machine(this.state_machine)
    }
}
