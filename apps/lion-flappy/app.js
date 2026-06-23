return {
    node_name: '',
    manifest: {
        timers: ['game_tick', 'crash_pause']
    },
    persist: {
        version: 15,
        data: ['high_score']
    },
    config: {},

    tick_period: 320,
    crash_pause: 900,
    bird_x: 58,
    bird_y: 110,
    bird_size: 12,
    velocity: 0,
    gravity: 1,
    flap_velocity: -4,
    pipe_width: 24,
    pipe_lip_width: 36,
    pipe_lip_height: 8,
    gap_height: 78,
    easy_gap_height: 92,
    min_gap_y: 42,
    max_gap_y: 138,
    pipe_speed: 10,
    play_top: 26,
    play_bottom: 216,
    tick_count: 0,
    score: 0,
    high_score: 0,
    game_state: 'title',
    pipes: [],

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
        response.move_hands = function (degrees_hour, degrees_minute, relative) {
            response.move = {
                h: degrees_hour,
                m: degrees_minute,
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

    wrap_state_machine: function (state_machine) {
        state_machine.set_current_state = state_machine.d
        state_machine.handle_event = state_machine._
        state_machine.get_current_state = function () {
            return state_machine.n
        }
        return state_machine
    },

    reset_game: function () {
        this.bird_y = 110
        this.velocity = 0
        this.score = 0
        this.tick_count = 0
        this.pipes = [
            this.create_pipe(202, true),
            this.create_pipe(335, false)
        ]
    },

    create_pipe: function (x, easy) {
        if (easy) {
            return {
                x: x,
                gap_y: 72,
                gap_h: this.easy_gap_height,
                scored: false,
                easy: true
            }
        }

        var gap = this.min_gap_y
            + Math.floor(Math.random() * ((this.max_gap_y - this.min_gap_y) / 10 + 1)) * 10
        return {
            x: x,
            gap_y: gap,
            gap_h: this.gap_height,
            scored: false,
            easy: false
        }
    },

    flap: function () {
        this.velocity = this.flap_velocity
    },

    start_playing: function (response) {
        this.game_state = 'playing'
        this.reset_game()
        this.flap()
        this.draw_game(response, true)
        start_timer(this.node_name, 'game_tick', this.tick_period)
    },

    stop_playing: function () {
        stop_timer(this.node_name, 'game_tick')
    },

    update_game: function () {
        var i
        this.tick_count++

        this.velocity += this.gravity
        if (this.velocity > 5) this.velocity = 5
        this.bird_y += this.velocity * 5

        for (i = 0; i < this.pipes.length; i++) {
            this.pipes[i].x -= this.pipe_speed

            if (
                this.pipes[i].scored === false
                && this.pipes[i].x + this.pipe_width < this.bird_x
            ) {
                this.pipes[i].scored = true
                this.score++
                if (this.score > this.high_score) {
                    this.high_score = this.score
                    save_node_persist(this.node_name)
                }
            }

            if (this.pipes[i].x < -this.pipe_lip_width) {
                this.pipes[i] = this.create_pipe(this.pipes[i].x + 265, false)
            }
        }

        if (this.has_collision()) {
            this.game_state = 'crashed'
            this.stop_playing()
            return false
        }

        return true
    },

    has_collision: function () {
        var bird_left = this.bird_x
        var bird_right = this.bird_x + this.bird_size
        var bird_top = this.bird_y
        var bird_bottom = this.bird_y + this.bird_size
        var i

        if (bird_top < this.play_top || bird_bottom > this.play_bottom) {
            return true
        }

        for (i = 0; i < this.pipes.length; i++) {
            var pipe = this.pipes[i]
            var pipe_left = pipe.x
            var pipe_right = pipe.x + this.pipe_width

            if (bird_right > pipe_left && bird_left < pipe_right) {
                if (bird_top < pipe.gap_y || bird_bottom > pipe.gap_y + pipe.gap_h) {
                    return true
                }
            }
        }

        return false
    },

    any_short_press: function (type) {
        return type === 'middle_short_press_release'
            || type === 'top_short_press_release'
            || type === 'bottom_short_press_release'
    },

    pipe_values: function (pipe, prefix, values, showPipes) {
        var topHeight = Math.max(0, pipe.gap_y - this.play_top)
        var bottomY = pipe.gap_y + pipe.gap_h
        var bottomHeight = Math.max(0, this.play_bottom - bottomY)
        var horizontalVisible = showPipes && pipe.x > -this.pipe_lip_width && pipe.x < 240
        var lipX = Math.floor(pipe.x - Math.floor((this.pipe_lip_width - this.pipe_width) / 2))

        values[prefix + '_x'] = Math.floor(pipe.x)
        values[prefix + '_body_inner_x'] = Math.floor(pipe.x + 1)
        values[prefix + '_body_hi_x'] = Math.floor(pipe.x + 3)
        values[prefix + '_body_shadow_x'] = Math.floor(pipe.x + this.pipe_width - 7)
        values[prefix + '_body_right_x'] = Math.floor(pipe.x + this.pipe_width - 2)

        values[prefix + '_lip_x'] = lipX
        values[prefix + '_lip_inner_x'] = Math.floor(lipX + 2)
        values[prefix + '_lip_hi_x'] = Math.floor(lipX + 4)
        values[prefix + '_lip_shadow_x'] = Math.floor(lipX + this.pipe_lip_width - 7)
        values[prefix + '_lip_right_x'] = Math.floor(lipX + this.pipe_lip_width - 2)

        values[prefix + '_top_h'] = topHeight
        values[prefix + '_top_lip_y'] = Math.max(this.play_top, pipe.gap_y - this.pipe_lip_height)
        values[prefix + '_top_lip_inner_y'] = values[prefix + '_top_lip_y'] + 1
        values[prefix + '_top_visible'] = horizontalVisible && topHeight > 0
        values[prefix + '_top_lip_visible'] = horizontalVisible && topHeight > 0

        values[prefix + '_bottom_y'] = bottomY
        values[prefix + '_bottom_h'] = bottomHeight
        values[prefix + '_bottom_lip_y'] = bottomY
        values[prefix + '_bottom_lip_inner_y'] = bottomY + 1
        values[prefix + '_bottom_visible'] = horizontalVisible && bottomHeight > 0
        values[prefix + '_bottom_lip_visible'] = horizontalVisible && bottomHeight > 0
    },

    draw_game: function (response, full_update) {
        var isPlaying = this.game_state === 'playing'
        var isCrashed = this.game_state === 'crashed'
        var showPlayfield = isPlaying || isCrashed
        var wingUp = this.velocity < 0 || this.tick_count % 2 === 0
        var wingY = wingUp ? this.bird_y + 2 : this.bird_y + 7

        var values = {
            json_file: 'lion_flappy_layout',

            bird_x: Math.floor(this.bird_x),
            bird_y: Math.floor(this.bird_y),
            wing_x: Math.floor(this.bird_x + 2),
            wing_y: Math.floor(wingY),
            beak_x: Math.floor(this.bird_x + 12),
            beak_y: Math.floor(this.bird_y + 4),
            eye_x: Math.floor(this.bird_x + 8),
            eye_y: Math.floor(this.bird_y + 2),
            bird_visible: showPlayfield,

            crash_x1: Math.floor(this.bird_x - 4),
            crash_x2: Math.floor(this.bird_x + 13),
            crash_y1: Math.floor(this.bird_y - 4),
            crash_y2: Math.floor(this.bird_y + 13),
            crash_visible: isCrashed,

            score_line: 'Score ' + this.score,

            title_visible: this.game_state === 'title',
            game_over_visible: this.game_state === 'game_over',
            hud_visible: isPlaying,

            title_text: "Lion's Flappy Bird",
            press_text: 'Press Any Button',
            game_over_text: 'Game Over',
            result_score: 'Score ' + this.score,
            result_high: 'High ' + this.high_score
        }

        this.pipe_values(this.pipes[0], 'p0', values, showPlayfield)
        this.pipe_values(this.pipes[1], 'p1', values, showPlayfield)

        // Gameplay: down-right diagonal, away from the centered top score.
        // Title / Game Over: right through the empty center band.
        if (showPlayfield) {
            response.move_hands(135, 135, false)
        } else {
            response.move_hands(90, 90, false)
        }

        response.draw_screen(this.node_name, full_update, values)
    },

    handle_global_event: function (self, state_machine, event, response) {
        if (
            event.type === 'system_state_update'
            && event.concerns_this_app === true
            && event.new_state === 'visible'
        ) {
            state_machine.set_current_state('title')
        } else if (event.type === 'middle_hold') {
            self.stop_playing()
            stop_timer(self.node_name, 'crash_pause')
            response.go_back(true)
        }
    },

    handle_state_specific_event: function (state, state_phase) {
        switch (state) {
            case 'background': {
                if (state_phase === 'during') {
                    return function (self, state_machine, event, response) {
                    }
                }
                break
            }

            case 'title': {
                if (state_phase === 'entry') {
                    return function (self, response) {
                        self.game_state = 'title'
                        self.reset_game()
                        self.draw_game(response, true)
                    }
                }

                if (state_phase === 'during') {
                    return function (self, state_machine, event, response) {
                        if (self.any_short_press(event.type)) {
                            state_machine.set_current_state('playing')
                            self.start_playing(response)
                        }
                    }
                }
                break
            }

            case 'playing': {
                if (state_phase === 'during') {
                    return function (self, state_machine, event, response) {
                        var type = event.type

                        if (self.any_short_press(type)) {
                            self.flap()
                            self.draw_game(response, false)
                        } else if (type === 'timer_expired') {
                            if (is_this_timer_expired(event, self.node_name, 'game_tick')) {
                                if (self.update_game()) {
                                    start_timer(self.node_name, 'game_tick', self.tick_period)
                                    self.draw_game(response, true)
                                } else {
                                    state_machine.set_current_state('crashed')
                                }
                            }
                        }
                    }
                }

                if (state_phase === 'exit') {
                    return function (self, response) {
                        self.stop_playing()
                    }
                }
                break
            }

            case 'crashed': {
                if (state_phase === 'entry') {
                    return function (self, response) {
                        self.game_state = 'crashed'
                        self.draw_game(response, true)
                        start_timer(self.node_name, 'crash_pause', self.crash_pause)
                    }
                }

                if (state_phase === 'during') {
                    return function (self, state_machine, event, response) {
                        if (event.type === 'timer_expired') {
                            if (is_this_timer_expired(event, self.node_name, 'crash_pause')) {
                                state_machine.set_current_state('game_over')
                            }
                        } else if (self.any_short_press(event.type)) {
                            stop_timer(self.node_name, 'crash_pause')
                            state_machine.set_current_state('game_over')
                        }
                    }
                }

                if (state_phase === 'exit') {
                    return function (self, response) {
                        stop_timer(self.node_name, 'crash_pause')
                    }
                }
                break
            }

            case 'game_over': {
                if (state_phase === 'entry') {
                    return function (self, response) {
                        self.game_state = 'game_over'
                        self.draw_game(response, true)
                    }
                }

                if (state_phase === 'during') {
                    return function (self, state_machine, event, response) {
                        if (self.any_short_press(event.type)) {
                            state_machine.set_current_state('title')
                        }
                    }
                }
                break
            }
        }

        return undefined
    },

    init: function () {
        this.reset_game()
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
